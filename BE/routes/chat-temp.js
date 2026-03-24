const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: {
          text: 'Thiếu message',
          products: []
        }
      });
    }

    const keyword = message.toLowerCase();

    let products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ]
    }).limit(5);

    if (products.length === 0) {
      products = await Product.find().limit(5);
    }

    let aiText = '';

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Bạn là nhân viên tư vấn mỹ phẩm.
Trả lời NGẮN GỌN.

Dữ liệu:
${products.map(p => `- ${p.name} (${p.price}đ)`).join('\n')}
`
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      aiText = completion.choices[0].message.content;

    } catch (err) {
      console.log("AI lỗi:", err.message);
    }

    res.json({
      reply: {
        text: aiText || "Shop gợi ý sản phẩm cho bạn 👇",
        products: products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image || ""
        }))
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: {
        text: "Lỗi server 😢",
        products: []
      }
    });
  }
});

module.exports = router;