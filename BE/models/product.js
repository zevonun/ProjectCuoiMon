const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const product = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: ObjectId, ref: 'category', required: true }, // liên kết với category
    sale: { type: Number, required: true }, 
    brandId: { type: ObjectId,default: null, ref: 'brand' }, // liên kết với brand
    image: { type: String, default: '' } 
    
  }
);



module.exports = mongoose.model('product', product);