// services/Upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type || 'others';
    const dir = path.join(__dirname, '..', 'public', 'uploads', type);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${ext}`);
  }
});

module.exports = multer({ storage });
