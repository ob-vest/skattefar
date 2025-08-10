export function formatDKK(value: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(rate: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(rate);
}
