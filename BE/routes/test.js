// BE/routes/test.js - Test route để debug token
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authen');

const jwtSecret = process.env.JWT_SECRET || 'shhhhh';

// Test endpoint: tạo token test
router.post('/create-test-token', (req, res) => {
  try {
    const testUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'user'
    };

    const token = jwt.sign(testUser, jwtSecret, { expiresIn: '24h' });

    console.log('🎫 Test token created:', token);

    res.json({
      success: true,
      token,
      message: 'Hãy copy token này vào localStorage với key: access_token'
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint: verify token
router.get('/verify-test-token', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token hợp lệ!',
    user: req.user
  });
});

module.exports = router;
