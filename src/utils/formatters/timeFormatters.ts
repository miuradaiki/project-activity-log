/**
 * Format hours with specified decimal precision
 * @param hours - Number of hours to format
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted hours string
 */
export const formatHours = (hours: number, precision = 1): string =>
  hours.toFixed(precision);

/**
 * Format total minutes to hours:minutes format (HH:MM)
 * @param totalMinutes - Total minutes to format
 * @returns Formatted time string in "H:MM" format
 */
export const formatMinutesToHM = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
