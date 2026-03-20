/**
 * Get user's timezone using Intl API
 */
export function getUserTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
        console.error('Failed to detect timezone:', error);
        return 'UTC';
    }
}

/**
 * Format percentage for display
 */
export function formatPercent(percent) {
    return `${Math.floor(percent)}%`;
}

/**
 * Format days for display
 */
export function formatDays(days) {
    return Math.floor(days);
}
