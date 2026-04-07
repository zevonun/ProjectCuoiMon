const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toSlug = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const ArticleSchema = new Schema(
  {
    title_vi: { type: String, required: true },
    slug_vi: { type: String, unique: true, index: true },
    keyword: { type: String, default: null },
    alt: { type: String, default: null },
    image: { type: String, default: null },
    short_description_vi: { type: String, default: null },
    content_vi: { type: String, required: true },
    num: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tự động tạo slug từ title_vi trước khi save
ArticleSchema.pre('save', function (next) {
  if (this.isModified('title_vi') || !this.slug_vi) {
    this.slug_vi = toSlug(this.title_vi);
  }
  next();
});

// Tự động tạo slug khi findOneAndUpdate / updateOne
ArticleSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();
  if (update?.title_vi && !update?.slug_vi) {
    update.slug_vi = toSlug(update.title_vi);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);
