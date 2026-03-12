const express = require('express');
const router = express.Router();
const Order = require('../models/order');

router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Tạo đơn thất bại' });
  }
});

module.exports = router;
