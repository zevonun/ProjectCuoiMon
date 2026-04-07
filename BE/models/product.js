const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const product = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: ObjectId, ref: 'category', required: true },
    subcategory: { type: String, default: null }, // Danh mục con
    sale: { type: Number, required: true },
    brandId: { type: ObjectId, default: null, ref: 'brand' },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);



module.exports = mongoose.model('product', product);