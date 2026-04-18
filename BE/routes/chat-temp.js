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
      'Với da dầu, nên ưu tiên làm sạch dịu nhẹ, serum mỏng nhẹ và kem dưỡng dạng gel để tránh bị tắc nghẽn. Bạn cũng nên dùng chống nắng mỗi ngày.',
    preferredKeywords: ['tra xanh', 'tea tree', 'niacinamide', 'oil control', 'mun'],
    categoryKeywords: ['sua rua mat', 'serum', 'kem duong', 'chong nang', 'tay trang', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'kem duong da', 'chong nang', 'dau - nuoc tay trang'],
    excludedKeywords: ['matte lipstick', 'son li']
  },
  {
    id: 'dry-skin',
    keywords: ['da kho', 'thieu am', 'bong troc', 'cang rat', 'da mat nuoc'],
    advice:
      'Với da khô, nên ưu tiên cấp ẩm và phục hồi hàng rào bảo vệ da. Bộ đôi sữa rửa mặt dịu nhẹ, serum cấp ẩm và kem dưỡng ẩm sẽ phù hợp hơn.',
    preferredKeywords: ['ha', 'hyaluronic', 'hydration', 'ceramide', 'rose', 'cap am', 'duong am'],
    categoryKeywords: ['sua rua mat', 'serum', 'kem duong', 'mat na', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'kem duong da', 'mat na duong da'],
    excludedKeywords: ['matte lipstick']
  },
  {
    id: 'dry-lips',
    keywords: ['moi kho', 'moi nut ne', 'duong moi', 'son duong', 'lip balm'],
    advice:
      'Nếu môi khô, bạn nên ưu tiên son dưỡng môi, mặt nạ môi và các sản phẩm môi có khả năng dưỡng ẩm. Nên hạn chế son lì quá khô nếu môi đang nứt nẻ.',
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
      'Với da mụn, nên giữ quy trình gọn nhẹ: tẩy trang nếu có makeup, rửa mặt dịu nhẹ, serum hỗ trợ làm dịu da và kem dưỡng mỏng nhẹ. Không nên chồng lớp quá nhiều sản phẩm.',
    preferredKeywords: ['tra xanh', 'tea tree', 'rau ma', 'centella', 'lam diu'],
    categoryKeywords: ['sua rua mat', 'serum', 'tay trang', 'toner'],
    recommendedCategories: ['sua rua mat', 'serum - tinh chat', 'dau - nuoc tay trang'],
    excludedKeywords: ['matte lipstick']
  }
];

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd') // đ → d để khớp từ khóa
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
      return `${profileAdvice} Shop gợi ý bạn tham khảo: ${productNames.join(', ')}.`;
    }

    if (profiles.some((profile) => profile.id === 'dry-lips')) {
      return `${profileAdvice} Hiện tại shop chưa có sản phẩm dưỡng môi đúng nghĩa phù hợp trong catalog.`;
    }

    return `${profileAdvice} Hiện tại shop chưa tìm được sản phẩm thật sự sát nhất, bạn có thể nói rõ hơn về vấn đề da hoặc ngân sách.`;
  }

  if (matchedProducts.length > 0) {
    return `Shop đã tìm thấy một số sản phẩm liên quan với nhu cầu của bạn. Bạn có thể xem qua ${matchedProducts
      .slice(0, 3)
      .map((product) => product.name)
      .join(', ')}. Nếu cần, bạn hãy nói rõ hơn tình trạng da để shop tư vấn sát hơn.`;
  }

  return 'Bạn hãy cho shop biết tình trạng như da dầu, da khô, môi khô, da mụn hoặc nhu cầu như cấp ẩm, làm sạch, chống nắng để shop tư vấn chính xác hơn.';
}

async function buildAiReply(message, matchedProducts, profiles, catalogStats) {
  if (!openai) {
    return '';
  }

  const promptProducts = matchedProducts.slice(0, 8);
  const promptProfiles = profiles.map((profile) => profile.id).join(', ') || 'không xác định';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Bạn là nhân viên tư vấn mỹ phẩm của shop. Trả lời bằng tiếng Việt ngắn gọn, thực tế, ưu tiên gợi ý theo dữ liệu sản phẩm được cung cấp. Chỉ gợi ý những sản phẩm thực sự phù hợp với nhu cầu, không chọn sản phẩm chỉ cùng danh mục nhưng sai công dụng. Không được đưa ra sản phẩm ngoài dữ liệu. Luôn viết đúng chính tả và dấu tiếng Việt.'
        },
        {
          role: 'user',
          content: [
            `Khách hỏi: ${message}`,
            `Tình trạng nhận diện: ${promptProfiles}`,
            `Tổng số sản phẩm trong catalog: ${catalogStats.totalProducts}`,
            `Danh mục hiện có: ${catalogStats.categoryNames.join(', ')}`,
            'Sản phẩm đã được lọc phù hợp:',
            ...promptProducts.map(
              (product) =>
                `- ${product.name} | giá ${product.price} | danh mục ${product.categoryName || 'không rõ'} | nhóm ${product.subcategory || 'không rõ'} | tồn kho ${product.stock}`
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
          text: 'Thiếu nội dung cần tư vấn.',
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
        text: 'Lỗi server khi tư vấn sản phẩm.',
        products: []
      }
    });
  }
});

module.exports = router;
