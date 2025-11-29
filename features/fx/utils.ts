export function formatYLabel(label: string): string {
  const num = Number(label);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
  })
    .format(num)
    .replace("NGN", "₦")
    .replace(/\u00A0/, " ");
}

export function sanitizeNumericInput(value: string, maxLength = 12) {
  return value.replace(/[^0-9]/g, "").slice(0, maxLength);
}
