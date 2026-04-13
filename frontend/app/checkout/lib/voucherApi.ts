import { apiPost } from '../../lib/apiClient';

export interface VoucherValidationResult {
  voucher: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  discount: number;
  finalAmount: number;
}

interface VoucherApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function validateVoucher(code: string, orderAmount: number): Promise<VoucherValidationResult> {
  const response = await apiPost('/api/vouchers/validate', {
    code: code.trim().toUpperCase(),
    orderAmount,
  });

  const data: VoucherApiResponse<VoucherValidationResult> = await response.json();

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Khong the ap dung voucher');
  }

  return data.data;
}

export async function applyVoucherToOrder(code: string, orderId: string): Promise<void> {
  const response = await apiPost('/api/vouchers/apply', {
    code: code.trim().toUpperCase(),
    orderId,
  });

  const data: VoucherApiResponse<unknown> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Khong the ghi nhan voucher');
  }
}

export async function getAvailableVouchers(): Promise<Array<{
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  minOrderAmount?: number;
}>> {
  try {
    const response = await fetch('/api/vouchers/available');
    if (!response.ok) {
      return [];
    }
    const data: VoucherApiResponse<Array<{
      code: string;
      type: 'percentage' | 'fixed';
      value: number;
      description?: string;
      minOrderAmount?: number;
    }>> = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch available vouchers:', error);
    return [];
  }
}
