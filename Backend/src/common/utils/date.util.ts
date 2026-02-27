/**
 * Date utility functions to simplify date calculations
 * Addresses KISS principle by providing clear, single-purpose functions
 */

/**
 * Add days to a date
 *
 * @example
 * const futureDate = addDays(new Date(), 30);
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add minutes to a date
 *
 * @example
 * const futureDate = addMinutes(new Date(), 30);
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Subtract days from a date
 *
 * @example
 * const pastDate = subDays(new Date(), 7);
 */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Calculate date expiration based on duration in days from start date
 *
 * @example
 * const expirationDate = calculateExpiration(new Date(), 30); // 30 days from now
 */
export function calculateExpiration(startDate: Date, durationDays: number): Date {
  return addDays(startDate, durationDays);
}

/**
 * Check if a date is in the past
 *
 * @example
 * if (isPast(expirationDate)) { ... }
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 *
 * @example
 * if (isFuture(startDate)) { ... }
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if a date is within a range (inclusive)
 *
 * @example
 * if (isWithinRange(date, startDate, endDate)) { ... }
 */
export function isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}

/**
 * Get start of day for a given date
 *
 * @example
 * const start = startOfDay(new Date());
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day for a given date
 *
 * @example
 * const end = endOfDay(new Date());
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month for a given date
 *
 * @example
 * const startOfMonth = startOfMonth(new Date());
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
