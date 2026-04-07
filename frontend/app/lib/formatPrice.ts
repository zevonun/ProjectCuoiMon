/**
 * Format price to Vietnamese Dong currency
 * @param price - Price in VND
 * @returns Formatted price string with VND symbol
 * @example formatPrice(1000000) => "1.000.000 ₫"
 */
export const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0 vnđ';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' vnđ';
};

/**
 * Format price without currency symbol (just numbers)
 * @param price - Price in VND
 * @returns Formatted price string without symbol
 * @example formatPriceNumber(1000000) => "1.000.000"
 */
export const formatPriceNumber = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
