export const SHIPPING_FEE = 50;
export const FREE_SHIPPING_THRESHOLD = 5000;

export function calculateDiscount(subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  return 0;
}

export function calculateShippingFee(subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function calculateNetTotal(subtotal: number, discount: number) {
  return Math.max(subtotal - discount, 0);
}

export function calculatePayableTotal(subtotal: number, discount: number) {
  return calculateNetTotal(subtotal, discount) + calculateShippingFee(subtotal);
}
