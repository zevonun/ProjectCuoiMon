const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momoController');

// POST /api/momo/create_payment
router.post('/create_payment', momoController.createPayment);

// POST /api/momo/ipn
router.post('/ipn', momoController.handleIPN);

module.exports = router;
