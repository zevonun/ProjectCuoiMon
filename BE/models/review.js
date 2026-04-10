// BE/models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    orderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: '' },
    status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

reviewSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
