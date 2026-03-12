import { CustomerInfo, FormErrors } from '../types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|0)?[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateCustomerInfo = (customerInfo: CustomerInfo): FormErrors => {
  const errors: FormErrors = {};

  if (!customerInfo.fullName?.trim()) {
    errors.fullName = 'Họ và tên không được để trống';
  }

  if (!customerInfo.phone?.trim()) {
    errors.phone = 'Số điện thoại không được để trống';
  } else if (!validatePhone(customerInfo.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (!customerInfo.email?.trim()) {
    errors.email = 'Email không được để trống';
  } else if (!validateEmail(customerInfo.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!customerInfo.address?.trim()) {
    errors.address = 'Địa chỉ giao hàng không được để trống';
  }

  if (!customerInfo.province?.trim()) {
    errors.province = 'Tỉnh/Thành phố không được để trống';
  }

  return errors;
};
