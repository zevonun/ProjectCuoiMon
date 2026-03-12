const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'shhhhh';

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Thiếu token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }

    const decoded = jwt.verify(token, jwtSecret);

    // ✅ SỬA: Token có cấu trúc { id, email, role }
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error('❌ Token error:', err.message);
    return res.status(401).json({ error: 'Token hết hạn hoặc không hợp lệ' });
  }
};

module.exports = { verifyToken };