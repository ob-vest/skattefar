export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function toAnnual(amount: number, period: "month" | "year"): number {
  return period === "month" ? amount * 12 : amount;
}
