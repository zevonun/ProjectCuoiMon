const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const ISSUE_PROFILES = [
  {
    id: 'oily-skin',
    keywords: ['da dau', 'do dau', 'nhieu dau', 'bong dau', 'lo chan long', 'da dau mun', 'da mun'],
    advice:
      'Voi da dau, nen uu tien lam sach diu nhe, serum mong nhe va kem duong dang gel de tranh bi tac nghen. Ban cung nen dung chong nang moi ngay.',
    preferredKeywords: ['tra xanh', 'tea tree', 'niacinamide', 'oil control', 'mun'],
    categoryKeywords: ['sua rua mat', 'serum', 'kem duong', 'chong nang', 'tay trang', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'kem duong da', 'chong nang', 'dau - nuoc tay trang'],
    excludedKeywords: ['matte lipstick', 'son li']
  },
  {
    id: 'dry-skin',
    keywords: ['da kho', 'thieu am', 'bong troc', 'cang rat', 'da mat nuoc'],
    advice:
      'Voi da kho, nen uu tien cap am va phuc hoi hang rao bao ve da. Bo doi sua rua mat diu nhe, serum cap am va kem duong am se phu hop hon.',
    preferredKeywords: ['ha', 'hyaluronic', 'hydration', 'ceramide', 'rose', 'cap am', 'duong am'],
    categoryKeywords: ['sua rua mat', 'serum', 'kem duong', 'mat na', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'kem duong da', 'mat na duong da'],
    excludedKeywords: ['matte lipstick']
  },
  {
    id: 'dry-lips',
    keywords: ['moi kho', 'moi nut ne', 'duong moi', 'son duong', 'lip balm'],
    advice:
      'Neu moi kho, ban nen uu tien son duong moi, mat na moi va cac san pham moi co kha nang duong am. Nen han che son li qua kho neu moi dang nut ne.',
    preferredKeywords: ['son duong', 'lip balm', 'duong moi', 'moi'],
    categoryKeywords: ['trang diem', 'son duong moi'],
    recommendedCategories: ['trang diem'],
    requiredKeywords: ['son duong', 'lip balm', 'duong moi'],
    excludedKeywords: ['matte', 'matte lipstick', 'li']
  },
  {
    id: 'acne-prone',
    keywords: ['mun', 'da mun', 'mun an', 'mun viem', 'tham mun'],
    advice:
      'Voi da mun, nen giu quy trinh gon nhe: tay trang neu co makeup, rua mat diu nhe, serum ho tro lam diu da va kem duong mong nhe. Khong nen chong lop qua nhieu san pham.',
    preferredKeywords: ['tra xanh', 'tea tree', 'rau ma', 'centella', 'lam diu'],
    categoryKeywords: ['sua rua mat', 'serum', 'tay trang', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'dau - nuoc tay trang'],
    excludedKeywords: ['matte lipstick']
  }
];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/d/g, 'd')
    .replace(/Ð/g, 'D')
    .toLowerCase()
    .trim();
}

function getPrice(product) {
  return product.sale && product.sale > 0 && product.sale < product.price
    ? product.sale
    : product.price;
}

function enrichProduct(product) {
  const categoryName = product.categoryId?.name || '';
  const subcategory = product.subcategory || '';
  const description = product.description || '';

  return {
    id: String(product._id),
    name: product.name,
    price: getPrice(product),
    originalPrice: product.price,
    image: product.image || '',
    stock: Number(product.stock || 0),
    categoryName,
    normalizedCategoryName: normalizeText(categoryName),
    subcategory,
    searchable: normalizeText([product.name, categoryName, subcategory, description].join(' '))
  };
}

function detectProfiles(message) {
  const normalizedMessage = normalizeText(message);

  return ISSUE_PROFILES.filter((profile) =>
    profile.keywords.some((keyword) => normalizedMessage.includes(keyword))
  );
}

function productMatchesProfile(product, profile) {
  const hasRecommendedCategory =
    !profile.recommendedCategories ||
    profile.recommendedCategories.some((category) =>
      product.normalizedCategoryName.includes(normalizeText(category))
    );

  const hasRequiredKeyword =
    !profile.requiredKeywords ||
    profile.requiredKeywords.some((keyword) =>
      product.searchable.includes(normalizeText(keyword))
    );

  const hasExcludedKeyword =
    Array.isArray(profile.excludedKeywords) &&
    profile.excludedKeywords.some((keyword) =>
      product.searchable.includes(normalizeText(keyword))
    );

  return hasRecommendedCategory && hasRequiredKeyword && !hasExcludedKeyword;
}

function scoreProduct(product, normalizedMessage, profiles) {
  let score = 0;

  if (product.stock > 0) {
    score += 3;
  }

  const directTokens = normalizedMessage.split(/\s+/).filter((token) => token.length >= 2);
  for (const token of directTokens) {
    if (product.searchable.includes(token)) {
      score += token.length > 3 ? 3 : 1;
    }
  }

  for (const profile of profiles) {
    if (!productMatchesProfile(product, profile)) {
      score -= 20;
      continue;
    }

    for (const keyword of profile.preferredKeywords) {
      if (product.searchable.includes(normalizeText(keyword))) {
        score += 6;
      }
    }

    for (const categoryKeyword of profile.categoryKeywords) {
      if (product.searchable.includes(normalizeText(categoryKeyword))) {
        score += 4;
      }
    }
  }

  return score;
}

function getStrictMatches(products, profiles) {
  if (profiles.length === 0) {
    return products;
  }

  return products.filter((product) =>
    profiles.every((profile) => productMatchesProfile(product, profile))
  );
}

function buildFallbackText(_message, matchedProducts, profiles) {
  if (profiles.length > 0) {
    const profileAdvice = profiles.map((profile) => profile.advice).join(' ');
    const productNames = matchedProducts.slice(0, 3).map((product) => product.name);

    if (productNames.length > 0) {
      return `${profileAdvice} Shop goi y ban tham khao: ${productNames.join(', ')}.`;
    }

    if (profiles.some((profile) => profile.id === 'dry-lips')) {
      return `${profileAdvice} Hien tai shop chua co san pham duong moi dung nghia phu hop trong catalog.`;
    }

    return `${profileAdvice} Hien tai shop chua tim duoc san pham that su sat nhat, ban co the noi ro hon ve van de da hoac ngan sach.`;
  }

  if (matchedProducts.length > 0) {
    return `Shop da tim thay mot so san pham lien quan voi nhu cau cua ban. Ban co the xem qua ${matchedProducts
      .slice(0, 3)
      .map((product) => product.name)
      .join(', ')}. Neu can, ban hay noi ro hon tinh trang da de shop tu van sat hon.`;
  }

  return 'Ban hay cho shop biet tinh trang nhu da dau, da kho, moi kho, da mun hoac nhu cau nhu cap am, lam sach, chong nang de shop tu van chinh xac hon.';
}

async function buildAiReply(message, matchedProducts, profiles, catalogStats) {
  if (!openai) {
    return '';
  }

  const promptProducts = matchedProducts.slice(0, 8);
  const promptProfiles = profiles.map((profile) => profile.id).join(', ') || 'khong xac dinh';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ban la nhan vien tu van my pham cua shop. Tra loi bang tieng Viet ngan gon, thuc te, uu tien goi y theo du lieu san pham duoc cung cap. Chi goi y nhung san pham thuc su phu hop voi nhu cau, khong chon san pham chi cung danh muc nhung sai cong dung. Khong duoc dua ra san pham ngoai du lieu.'
        },
        {
          role: 'user',
          content: [
            `Khach hoi: ${message}`,
            `Tinh trang nhan dien: ${promptProfiles}`,
            `Tong so san pham trong catalog: ${catalogStats.totalProducts}`,
            `Danh muc hien co: ${catalogStats.categoryNames.join(', ')}`,
            'San pham da duoc loc phu hop:',
            ...promptProducts.map(
              (product) =>
                `- ${product.name} | gia ${product.price} | danh muc ${product.categoryName || 'khong ro'} | nhom ${product.subcategory || 'khong ro'} | ton kho ${product.stock}`
            )
          ].join('\n')
        }
      ]
    });

    return completion.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.log('AI chat error:', error.message);
    return '';
  }
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        reply: {
          text: 'Thieu noi dung can tu van.',
          products: []
        }
      });
    }

    const allProducts = await Product.find()
      .populate('categoryId', 'name slug')
      .lean();

    const normalizedMessage = normalizeText(message);
    const profiles = detectProfiles(message);
    const enrichedProducts = allProducts.map(enrichProduct);
    const strictlyMatchedProducts = getStrictMatches(enrichedProducts, profiles);

    const scoredProducts = (strictlyMatchedProducts.length > 0 ? strictlyMatchedProducts : enrichedProducts)
      .map((product) => ({
        ...product,
        score: scoreProduct(product, normalizedMessage, profiles)
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.stock > 0) !== (a.stock > 0)) return b.stock - a.stock;
        return a.price - b.price;
      });

    const matchedProducts = scoredProducts
      .filter((product) => product.score > 0)
      .slice(0, 5);

    const fallbackProducts = scoredProducts
      .filter((product) => product.stock > 0)
      .slice(0, 5);

    const chosenProducts = matchedProducts.length > 0 ? matchedProducts : fallbackProducts;

    const responseProducts = chosenProducts.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || ''
    }));

    const aiText = await buildAiReply(
      message,
      chosenProducts,
      profiles,
      {
        totalProducts: enrichedProducts.length,
        categoryNames: [...new Set(enrichedProducts.map((product) => product.categoryName).filter(Boolean))]
      }
    );

    res.json({
      reply: {
        text: aiText || buildFallbackText(message, matchedProducts, profiles),
        products: responseProducts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: {
        text: 'Loi server khi tu van san pham.',
        products: []
      }
    });
  }
});

module.exports = router;
