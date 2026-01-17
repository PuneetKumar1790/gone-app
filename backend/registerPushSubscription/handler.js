const { getUsersCollection } = require('../shared/database');
const { calculateYearProgress } = require('../shared/yearProgress');

/**
 * HTTP handler: Register push subscription
 */
async function registerPushSubscription(request, context) {
    context.log('registerPushSubscription invoked');

    try {
        const body = await request.json();
        const { subscription, timezone } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid request',
                    message: 'Subscription object is required with endpoint and keys',
                }),
            };
        }

        if (!timezone) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid request',
                    message: 'Timezone is required',
                }),
            };
        }

        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        } catch (error) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid timezone',
                    message: 'Please provide a valid IANA timezone',
                }),
            };
        }

        const currentYear = new Date().getFullYear();
        const currentPercent = calculateYearProgress(timezone, currentYear);
        const usersCollection = await getUsersCollection();

        const existingUser = await usersCollection.findOne({
            'pushSubscription.endpoint': subscription.endpoint,
        });

        if (existingUser) {
            await usersCollection.updateOne(
                { 'pushSubscription.endpoint': subscription.endpoint },
                {
                    $set: {
                        timezone,
                        year: currentYear,
                        lastNotifiedPercent: currentPercent,
                        pushSubscription: subscription,
                        notificationsEnabled: true,
                        updatedAt: new Date(),
                    },
                }
            );

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Subscription updated successfully',
                    currentPercent,
                }),
            };
        } else {
            await usersCollection.insertOne({
                timezone,
                year: currentYear,
                lastNotifiedPercent: currentPercent,
                pushSubscription: subscription,
                notificationsEnabled: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Subscription registered successfully',
                    currentPercent,
                }),
            };
        }
    } catch (error) {
        context.log('Error in registerPushSubscription:', error);
        return {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
            }),
        };
    }
}

module.exports = { registerPushSubscription };
