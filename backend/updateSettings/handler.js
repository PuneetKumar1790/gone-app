const { getUsersCollection } = require('../shared/database');

/**
 * HTTP handler: Update user settings
 */
async function updateSettings(request, context) {
    context.log('updateSettings invoked');

    try {
        const body = await request.json();
        const { endpoint, timezone, notificationsEnabled } = body;

        if (!endpoint) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid request',
                    message: 'Subscription endpoint is required to identify the user',
                }),
            };
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({
            'pushSubscription.endpoint': endpoint,
        });

        if (!user) {
            return {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'User not found',
                    message: 'No subscription found with this endpoint',
                }),
            };
        }

        const updates = {
            updatedAt: new Date(),
        };

        if (timezone !== undefined) {
            try {
                new Intl.DateTimeFormat('en-US', { timeZone: timezone });
                updates.timezone = timezone;
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
        }

        if (notificationsEnabled !== undefined) {
            if (typeof notificationsEnabled !== 'boolean') {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Invalid request',
                        message: 'notificationsEnabled must be a boolean',
                    }),
                };
            }
            updates.notificationsEnabled = notificationsEnabled;
        }

        await usersCollection.updateOne(
            { 'pushSubscription.endpoint': endpoint },
            { $set: updates }
        );

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Settings updated successfully',
                updates,
            }),
        };
    } catch (error) {
        context.log('Error in updateSettings:', error);
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

module.exports = { updateSettings };
