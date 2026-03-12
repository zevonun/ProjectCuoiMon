"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Pencil,
    Trash2,
    Calendar,
    Ticket,
    Search,
    X,
    Clock,
    Tag,
    Percent,
    DollarSign,
    RefreshCw,
} from "lucide-react";
import "./vouchers.css";
import {
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    type Voucher,
    type VoucherFormData,
} from "@/lib/voucherApi";
import { getUser, getAccessToken } from "@/lib/auth";

export default function VouchersPage() {
    const router = useRouter();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [formData, setFormData] = useState<VoucherFormData>({
        code: "",
        type: "percentage",
        value: 0,
        minOrder: 0,
        maxDiscount: 0,
        quantity: 0,
        startDate: "",
        endDate: "",
        status: "scheduled",
        description: "",
    });

    // ✅ Hàm tạo mã voucher ngẫu nhiên
    const generateRandomCode = () => {
        const prefixes = ['SALE', 'DEAL', 'DISCOUNT', 'PROMO', 'SAVE'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên
        const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 chữ cái ngẫu nhiên

        return `${prefix}${randomNumber}${randomLetters}`;
    };

    const loadVouchers = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Loading vouchers...');

            const response = await getAllVouchers();
            console.log('Response:', response);

            if (response && response.data) {
                setVouchers(response.data);
                console.log('Loaded', response.data.length, 'vouchers');
            }
        } catch (error) {
            console.error("Error loading vouchers:", error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                router.push('/login');
            } else {
                alert("Không thể tải danh sách vouchers: " + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        // ✅ Kiểm tra authentication
        const user = getUser();
        const token = getAccessToken();

        console.log('User:', user);
        console.log('Token:', token ? 'Exists' : 'Missing');

        if (!user || !token) {
            console.log('No auth, redirecting to login...');
            alert('Vui lòng đăng nhập để tiếp tục');
            router.push('/login');
            return;
        }

        if (user.role !== 'admin') {
            console.log('Not admin, access denied');
            alert('Bạn không có quyền truy cập trang này');
            router.push('/dashboard');
            return;
        }

        // ✅ Nếu đã xác thực, load vouchers
        loadVouchers();
    }, [router, loadVouchers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Convert datetime-local to ISO string
            const submitData = {
                ...formData,
                value: Number(formData.value),
                minOrder: Number(formData.minOrder),
                maxDiscount: Number(formData.maxDiscount) || 0,
                quantity: Number(formData.quantity),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };

            console.log('Submit data:', submitData);

            if (editingVoucher) {
                await updateVoucher(editingVoucher._id, submitData);
                alert("Cập nhật voucher thành công!");
            } else {
                await createVoucher(submitData);
                alert("Tạo voucher thành công!");
            }

            await loadVouchers();
            closeModal();
        } catch (error) {
            console.error("Submit error:", error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                router.push('/login');
            } else {
                alert(errorMessage || "Có lỗi xảy ra");
            }
        }
    };

    const openModal = (voucher?: Voucher) => {
        if (voucher) {
            setEditingVoucher(voucher);

            // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
            const startDate = new Date(voucher.startDate);
            const endDate = new Date(voucher.endDate);

            const formatDatetimeLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                code: voucher.code,
                type: voucher.type,
                value: voucher.value,
                minOrder: voucher.minOrder,
                maxDiscount: voucher.maxDiscount || 0,
                quantity: voucher.quantity,
                startDate: formatDatetimeLocal(startDate),
                endDate: formatDatetimeLocal(endDate),
                status: voucher.status,
                description: voucher.description || "",
            });
        } else {
            setEditingVoucher(null);

            // Set default dates (now and +30 days)
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            const formatDatetimeLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                code: generateRandomCode(), // ✅ Tự động tạo mã ngẫu nhiên
                type: "percentage",
                value: 0,
                minOrder: 0,
                maxDiscount: 0,
                quantity: 0,
                startDate: formatDatetimeLocal(now),
                endDate: formatDatetimeLocal(futureDate),
                status: "scheduled",
                description: "",
            });
        }

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVoucher(null);
        setFormData({
            code: "",
            type: "percentage",
            value: 0,
            minOrder: 0,
            maxDiscount: 0,
            quantity: 0,
            startDate: "",
            endDate: "",
            status: "scheduled",
            description: "",
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa voucher này?")) return;

        try {
            await deleteVoucher(id);
            alert("Xóa voucher thành công!");
            await loadVouchers();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Có lỗi xảy ra khi xóa voucher");
        }
    };

    const filteredVouchers = vouchers.filter((v) =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
    };

    const getStatusBadgeClass = (status: string) => {
        const classes = {
            active: "badge-active",
            scheduled: "badge-scheduled",
            expired: "badge-expired",
            inactive: "badge-inactive",
        };
        return classes[status as keyof typeof classes] || "";
    };

    const getStatusText = (status: string) => {
        const texts = {
            active: "Đang hoạt động",
            scheduled: "Đã lên lịch",
            expired: "Hết hạn",
            inactive: "Tạm dừng",
        };
        return texts[status as keyof typeof texts] || status;
    };

    if (loading) {
        return (
            <div className="vouchers-page">
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                    Đang tải...
                </div>
            </div>
        );
    }

    return (
        <div className="vouchers-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>
                        <Ticket size={32} />
                        Quản lý Vouchers
                    </h1>
                    <p>Tạo và quản lý các mã giảm giá cho khách hàng</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    Tạo Voucher Mới
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã voucher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Vouchers Grid */}
            <div className="vouchers-grid">
                {filteredVouchers.length === 0 ? (
                    <div className="empty-state">
                        <Ticket size={64} />
                        <p>Chưa có voucher nào</p>
                    </div>
                ) : (
                    filteredVouchers.map((voucher) => (
                        <div key={voucher._id} className="voucher-card">
                            {/* Header */}
                            <div className="voucher-header">
                                <div className="voucher-code">
                                    <Tag size={18} />
                                    {voucher.code}
                                </div>
                                <span className={`status-badge ${getStatusBadgeClass(voucher.status)}`}>
                                    {getStatusText(voucher.status)}
                                </span>
                            </div>

                            {/* Description */}
                            {voucher.description && (
                                <p className="voucher-description">{voucher.description}</p>
                            )}

                            {/* Details */}
                            <div className="voucher-details">
                                <div className="detail-item">
                                    {voucher.type === "percentage" ? (
                                        <Percent size={16} />
                                    ) : (
                                        <DollarSign size={16} />
                                    )}
                                    <span>
                                        Giảm {voucher.type === "percentage" ? `${voucher.value}%` : formatCurrency(voucher.value)}
                                        {voucher.type === "percentage" && voucher.maxDiscount
                                            ? ` (Tối đa ${formatCurrency(voucher.maxDiscount)})`
                                            : ""}
                                    </span>
                                </div>

                                <div className="detail-item">
                                    <Tag size={16} />
                                    <span>Đơn tối thiểu: {formatCurrency(voucher.minOrder)}</span>
                                </div>

                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span className="text-muted">
                                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Usage */}
                            <div className="voucher-usage">
                                <div className="usage-bar">
                                    <div
                                        className="usage-fill"
                                        style={{
                                            width: `${(voucher.used / voucher.quantity) * 100}%`,
                                        }}
                                    />
                                </div>
                                <div className="usage-text">
                                    Đã dùng: {voucher.used}/{voucher.quantity}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="voucher-actions">
                                <button className="btn-edit" onClick={() => openModal(voucher)}>
                                    <Pencil size={16} />
                                    Sửa
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(voucher._id)}>
                                    <Trash2 size={16} />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
                            </h2>
                            <button className="btn-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                {/* ✅ Mã voucher với nút tạo ngẫu nhiên - READONLY */}
                                <div className="form-group">
                                    <label>Mã Voucher * (Tự động tạo)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Click nút để tạo mã"
                                            value={formData.code}
                                            readOnly
                                            required
                                            style={{
                                                flex: 1,
                                                cursor: 'not-allowed',
                                                background: 'rgba(15, 23, 42, 0.3)',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                                            style={{
                                                padding: '10px 16px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                borderRadius: '6px',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s',
                                                fontWeight: '600',
                                                fontSize: '13px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                            }}
                                            title="Tạo mã ngẫu nhiên"
                                        >
                                            <RefreshCw size={16} />
                                            Tạo mã
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Loại giảm giá *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                type: e.target.value as "percentage" | "fixed",
                                            })
                                        }
                                        required
                                    >
                                        <option value="percentage">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (đ)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Giá trị giảm *{" "}
                                        {formData.type === "percentage" ? "(%)" : "(đ)"}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="VD: 20"
                                        value={formData.value || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                value: Number(e.target.value),
                                            })
                                        }
                                        required
                                        min="0"
                                        step="any"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Giá trị đơn tối thiểu (đ) *</label>
                                    <input
                                        type="number"
                                        placeholder="VD: 100000"
                                        value={formData.minOrder || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minOrder: Number(e.target.value),
                                            })
                                        }
                                        required
                                        min="0"
                                    />
                                </div>

                                {formData.type === "percentage" && (
                                    <div className="form-group">
                                        <label>Giảm tối đa (đ)</label>
                                        <input
                                            type="number"
                                            placeholder="VD: 50000"
                                            value={formData.maxDiscount || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxDiscount: Number(e.target.value),
                                                })
                                            }
                                            min="0"
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Số lượng *</label>
                                    <input
                                        type="number"
                                        placeholder="VD: 100"
                                        value={formData.quantity || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity: Number(e.target.value),
                                            })
                                        }
                                        required
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ngày bắt đầu *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startDate: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ngày kết thúc *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, endDate: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value as "scheduled" | "active" | "expired" | "inactive" })
                                        }
                                        required
                                    >
                                        <option value="scheduled">Đã lên lịch</option>
                                        <option value="active">Kích hoạt ngay</option>
                                        <option value="inactive">Tạm dừng</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Mô tả</label>
                                    <textarea
                                        placeholder="Mô tả voucher..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    <Calendar size={18} />
                                    {editingVoucher ? "Cập nhật" : "Tạo Voucher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}