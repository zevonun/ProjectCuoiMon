const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// Helper: chuyển tên tiếng Việt → slug
// "Em Bé" → "em-be", "Trang Điểm" → "trang-diem"
const toSlug = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const categorySchema = new Schema({
  name:     { type: String, required: true },
  slug:     { type: String, unique: true, sparse: true }, // ✅ thêm slug
  parentId: { type: ObjectId, default: null, ref: 'category' },
});

// Tự động tạo slug từ name trước khi save
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = toSlug(this.name);
  }
  next();
});

// Tự động tạo slug khi findOneAndUpdate / updateOne
categorySchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();
  if (update?.name && !update?.slug) {
    update.slug = toSlug(update.name);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('category', categorySchema);
