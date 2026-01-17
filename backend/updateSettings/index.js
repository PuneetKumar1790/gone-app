const { getUsersCollection } = require('../shared/database');

module.exports = async function (context, req) {
    context.log('updateSettings invoked');

    try {
        const { endpoint, timezone, notificationsEnabled } = req.body;

        if (!endpoint) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid request',
                    message: 'Subscription endpoint is required to identify the user',
                }),
            };
            return;
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({
            'pushSubscription.endpoint': endpoint,
        });

        if (!user) {
            context.res = {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'User not found',
                    message: 'No subscription found with this endpoint',
                }),
            };
            return;
        }

        const updates = {
            updatedAt: new Date(),
        };

        if (timezone !== undefined) {
            try {
                new Intl.DateTimeFormat('en-US', { timeZone: timezone });
                updates.timezone = timezone;
            } catch (error) {
                context.res = {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Invalid timezone',
                        message: 'Please provide a valid IANA timezone',
                    }),
                };
                return;
            }
        }

        if (notificationsEnabled !== undefined) {
            if (typeof notificationsEnabled !== 'boolean') {
                context.res = {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Invalid request',
                        message: 'notificationsEnabled must be a boolean',
                    }),
                };
                return;
            }
            updates.notificationsEnabled = notificationsEnabled;
        }

        await usersCollection.updateOne(
            { 'pushSubscription.endpoint': endpoint },
            { $set: updates }
        );

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Settings updated successfully',
                updates,
            }),
        };
    } catch (error) {
        context.log('Error in updateSettings:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
            }),
        };
    }
};
