const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

/**
 * Get current year progress
 * @param {string} timezone - IANA timezone
 * @returns {Promise<object>}
 */
export async function getCurrentProgress(timezone) {
    const response = await fetch(`${API_BASE_URL}/progress?timezone=${encodeURIComponent(timezone)}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch progress');
    }

    return response.json();
}

/**
 * Register push subscription
 * @param {object} subscription - Push subscription object
 * @param {string} timezone - IANA timezone
 * @returns {Promise<object>}
 */
export async function registerSubscription(subscription, timezone) {
    const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription, timezone }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register subscription');
    }

    return response.json();
}

/**
 * Update user settings
 * @param {string} endpoint - Subscription endpoint
 * @param {object} settings - Settings to update
 * @returns {Promise<object>}
 */
export async function updateSettings(endpoint, settings) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, ...settings }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
    }

    return response.json();
}
