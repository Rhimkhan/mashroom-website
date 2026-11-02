/**
 * Utility functions for consistent monetary and date formatting across AKHIL FOODS.
 */

/**
 * Formats a numerical amount into Indian Rupee currency format (e.g. ₹399, ₹1,299).
 *
 * @param amount - Numerical amount in INR
 * @returns Formatted currency string with ₹ symbol
 */
export function formatPrice(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Formats a date string, timestamp, or Date object into human-readable Indian date format (e.g. "16 Oct 2026").
 *
 * @param date - Date input representation
 * @returns Formatted date string
 */
export function formatDate(date: string | number | Date): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Formats a date and time into a readable timestamp string (e.g. "16 Oct 2026, 05:30 PM").
 *
 * @param date - Date input representation
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | number | Date): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}
