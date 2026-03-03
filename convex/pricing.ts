// Shipping configuration
export const SHIPPING_FEE = 50;
export const FREE_SHIPPING_THRESHOLD = 5000;

export function calculateDiscount(subtotal: number): number {
  if (subtotal <= 0) {
    return 0;
  }

  // İndirim mantığı buraya eklenebilir
  // Örnek: 1000 TL üzeri %5 indirim
  if (subtotal >= 1000) {
    return Math.floor(subtotal * 0.05);
  }

  return 0;
}

export function calculateShippingFee(subtotal: number): number {
  if (subtotal <= 0) {
    return 0;
  }

  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function calculateNetTotal(subtotal: number, discount: number): number {
  return Math.max(subtotal - discount, 0);
}

export function calculatePayableTotal(subtotal: number, discount: number): number {
  return calculateNetTotal(subtotal, discount) + calculateShippingFee(subtotal);
}
