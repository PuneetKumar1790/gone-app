/**
 * Utility functions for calculating year progress
 * Handles timezones and leap years correctly
 */

/**
 * Check if a year is a leap year
 * @param {number} year - The year to check
 * @returns {boolean}
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get total days in a year
 * @param {number} year - The year
 * @returns {number} - 365 or 366
 */
function getTotalDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

/**
 * Calculate days passed in the year for a given timezone
 * @param {string} timezone - IANA timezone (e.g., 'Asia/Kolkata')
 * @param {number} year - The year to calculate for
 * @returns {number} - Days passed (includes partial day as decimal)
 */
function calculateDaysPassed(timezone, year) {
    try {
        // Get current time in the user's timezone
        const now = new Date();
        const options = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);

        const tzYear = parseInt(parts.find(p => p.type === 'year').value);
        const tzMonth = parseInt(parts.find(p => p.type === 'month').value);
        const tzDay = parseInt(parts.find(p => p.type === 'day').value);
        const tzHour = parseInt(parts.find(p => p.type === 'hour').value);
        const tzMinute = parseInt(parts.find(p => p.type === 'minute').value);
        const tzSecond = parseInt(parts.find(p => p.type === 'second').value);

        // If current year in timezone doesn't match requested year, handle edge case
        if (tzYear !== year) {
            if (tzYear > year) {
                // Year has ended in this timezone
                return getTotalDaysInYear(year);
            } else {
                // Year hasn't started yet in this timezone
                return 0;
            }
        }

        // Create date object for start of year in UTC (we'll calculate offset-aware)
        const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
        const currentDate = new Date(Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond));

        // Calculate milliseconds passed
        const msPassed = currentDate - yearStart;
        const daysPassed = msPassed / (1000 * 60 * 60 * 24);

        return Math.max(0, daysPassed);
    } catch (error) {
        console.error(`Error calculating days passed for timezone ${timezone}:`, error);
        // Fallback to UTC
        const now = new Date();
        const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
        const msPassed = now - yearStart;
        return Math.max(0, msPassed / (1000 * 60 * 60 * 24));
    }
}

/**
 * Calculate year progress percentage (floored to whole number)
 * @param {string} timezone - IANA timezone
 * @param {number} year - The year
 * @returns {number} - Percentage (0-100, floored)
 */
function calculateYearProgress(timezone, year) {
    const totalDays = getTotalDaysInYear(year);
    const daysPassed = calculateDaysPassed(timezone, year);
    const percent = (daysPassed / totalDays) * 100;
    return Math.floor(Math.min(100, Math.max(0, percent)));
}

/**
 * Get comprehensive year progress data
 * @param {string} timezone - IANA timezone
 * @param {number} year - The year
 * @returns {object} - Complete progress data
 */
function getYearProgressData(timezone, year) {
    const totalDays = getTotalDaysInYear(year);
    const daysPassed = calculateDaysPassed(timezone, year);
    const percentComplete = Math.floor((daysPassed / totalDays) * 100);
    const percentRemaining = 100 - percentComplete;
    const daysRemaining = Math.ceil(totalDays - daysPassed);

    return {
        year,
        percentComplete: Math.min(100, Math.max(0, percentComplete)),
        percentRemaining: Math.max(0, percentRemaining),
        daysPassed: Math.floor(daysPassed),
        daysRemaining: Math.max(0, daysRemaining),
        nextNotificationAt: Math.min(100, percentComplete + 1),
    };
}

module.exports = {
    isLeapYear,
    getTotalDaysInYear,
    calculateDaysPassed,
    calculateYearProgress,
    getYearProgressData,
};
