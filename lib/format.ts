export function formatPrice(value: number, currency: "TRY" | "USD" | "EUR" = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
