const webpush = require('web-push');

// Initialize web-push with VAPID keys
function initializeWebPush() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
        throw new Error('VAPID configuration is incomplete. Check environment variables.');
    }

    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

/**
 * Send a push notification to a user
 * @param {object} subscription - Web push subscription object
 * @param {number} percent - The percentage to notify about
 * @returns {Promise<void>}
 */
async function sendPercentNotification(subscription, percent) {
    initializeWebPush();

    const payload = JSON.stringify({
        title: `⏳ ${percent}% of the year is gone`,
        body: 'Another chunk burned. Adjust course if needed.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-96x96.png',
        tag: `year-progress-${percent}`,
        requireInteraction: false,
        data: {
            percent,
            url: '/',
        },
    });

    const options = {
        TTL: 86400, // 24 hours
    };

    try {
        await webpush.sendNotification(subscription, payload, options);
        return { success: true };
    } catch (error) {
        // Handle subscription errors (e.g., expired, invalid)
        if (error.statusCode === 404 || error.statusCode === 410) {
            // Subscription is no longer valid
            return { success: false, expired: true, error: error.message };
        }
        // Other errors (network, etc.)
        return { success: false, expired: false, error: error.message };
    }
}

/**
 * Send notifications to multiple users (batch processing)
 * @param {Array<{subscription: object, percent: number, userId: string}>} notifications
 * @returns {Promise<Array<{userId: string, success: boolean, expired: boolean}>>}
 */
async function sendBatchNotifications(notifications) {
    const results = await Promise.allSettled(
        notifications.map(async ({ subscription, percent, userId }) => {
            const result = await sendPercentNotification(subscription, percent);
            return { userId, ...result };
        })
    );

    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                userId: notifications[index].userId,
                success: false,
                expired: false,
                error: result.reason?.message || 'Unknown error',
            };
        }
    });
}

module.exports = {
    sendPercentNotification,
    sendBatchNotifications,
};
