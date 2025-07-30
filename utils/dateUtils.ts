export function formatDate(dateStr: string): string {
    if (dateStr === "???") return dateStr;
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
    } catch {
        return dateStr;
    }
}

/**
 * Форматирует Date в строку для input[type="date"] (YYYY-MM-DD)
 * @param date Дата
 * @returns Строка в формате YYYY-MM-DD
 */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Calculates the number of days between two dates
 * @param startDate - Start date in format YYYY-MM-DD or Date object
 * @param endDate - End date in format YYYY-MM-DD or Date object
 * @returns Number of days between dates (always positive)
 */
export function calculateDaysBetween(startDate: string | Date, endDate: string | Date): number {
    // Convert string dates to Date objects if needed
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Ensure dates are valid
    if (isNaN(start.getTime())) throw new Error('Invalid start date');
    if (isNaN(end.getTime())) throw new Error('Invalid end date');

    // Normalize times to midnight to compare whole days
    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffMs = Math.abs(normalizedEnd.getTime() - normalizedStart.getTime());

    // Convert milliseconds to days
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
