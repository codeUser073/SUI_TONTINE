/**
 * Utility functions for consistent number formatting across server and client
 */

/**
 * Format a number with commas, ensuring consistent formatting between server and client
 * @param num - The number to format
 * @returns Formatted string with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a number with a specific number of decimal places
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with specified decimal places
 */
export function formatNumberWithDecimals(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format a currency amount (e.g., SUI tokens)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @param symbol - Currency symbol (default: '')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, decimals: number = 2, symbol: string = ''): string {
  const formatted = formatNumberWithDecimals(amount, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}
