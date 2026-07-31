/**
 * Rupees, with paise only when they exist — ₹899, but ₹2,157.60. Automatic
 * discounts don't land on round numbers, so totals can't assume integers.
 */
export function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
