// models/adminLog.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminLogSchema = new Schema(
  {
    // Admin thực hiện hành động
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },

    // Hành động (create, update, delete, deactivate, etc)
    action: { 
      type: String, 
      enum: ['create_admin', 'update_admin', 'delete_admin', 'deactivate_admin', 'activate_admin', 'update_permissions'],
      required: true 
    },

    // Admin target bị tác động
    targetAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    targetAdminName: { type: String, default: null },
    targetAdminEmail: { type: String, default: null },

    // Chi tiết thay đổi
    details: { type: Schema.Types.Mixed, default: {} },

    // IP address
    ipAddress: { type: String, default: null },

    // Status
    status: { type: String, enum: ['success', 'failed'], default: 'success' },

    // Message
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index cho tìm kiếm nhanh
AdminLogSchema.index({ adminId: 1, createdAt: -1 });
AdminLogSchema.index({ action: 1, createdAt: -1 });
AdminLogSchema.index({ targetAdminId: 1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
