// models/user.js
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String },

    address: { type: String },

    // ── password: null nếu login bằng Google ──
    password: { type: String, default: null },

    age: { type: Number },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // ✅ Permissions
    permissions: {
      manage_products: { type: Boolean, default: false },
      manage_orders: { type: Boolean, default: false },
      manage_users: { type: Boolean, default: false },
      manage_banners: { type: Boolean, default: false },
      manage_categories: { type: Boolean, default: false },
      manage_vouchers: { type: Boolean, default: false },
      manage_admins: { type: Boolean, default: false },
      manage_articles: { type: Boolean, default: false },
    },

    refreshToken: { type: String, default: null },

    // ✅ Google OAuth – lưu Google sub ID
    googleId: {
      type:   String,
      default: null,
      // sparse: true → cho phép nhiều document có null nhưng chỉ 1 document có cùng googleId
    },
  },
  { timestamps: true }
);

// Index sparse cho googleId
UserSchema.index({ googleId: 1, sparse: true });

module.exports = mongoose.model('User', UserSchema);
