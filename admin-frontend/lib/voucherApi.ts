// lib/voucherApi.ts
import { apiFetch } from './api';

export interface Voucher {
    _id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    quantity: number;
    used: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'expired' | 'inactive';
    description: string;
}

export interface VoucherFormData {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    quantity: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'expired' | 'inactive';
    description: string;
}

export async function getAllVouchers() {
    const res = await apiFetch('/admin/vouchers');
    if (!res || !res.ok) throw new Error('Failed to fetch vouchers');
    return res.json();
}

export async function createVoucher(data: VoucherFormData) {
    console.log('📤 Sending to backend:', data);
    const res = await apiFetch('/admin/vouchers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res || !res.ok) {
        const errorData = await res.json().catch(() => null);
        const validationMessage = Array.isArray(errorData?.errors) && errorData.errors.length > 0
            ? errorData.errors[0].msg
            : null;
        throw new Error(validationMessage || errorData?.message || 'Failed to create voucher');
    }
    return res.json();
}

export async function updateVoucher(id: string, data: Partial<VoucherFormData>) {
    const res = await apiFetch(`/admin/vouchers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res || !res.ok) {
        const errorData = await res.json().catch(() => null);
        const validationMessage = Array.isArray(errorData?.errors) && errorData.errors.length > 0
            ? errorData.errors[0].msg
            : null;
        throw new Error(validationMessage || errorData?.message || 'Failed to update voucher');
    }
    return res.json();
}

export async function deleteVoucher(id: string) {
    const res = await apiFetch(`/admin/vouchers/${id}`, {
        method: 'DELETE',
    });
    if (!res || !res.ok) throw new Error('Failed to delete voucher');
    return res.json();
}
