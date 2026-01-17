const { getUsersCollection } = require('../shared/database');
const { calculateYearProgress } = require('../shared/yearProgress');
const { sendBatchNotifications } = require('../shared/pushService');

/**
 * Timer trigger handler - runs every hour
 */
async function checkYearProgress(myTimer, context) {
    context.log('Year progress check started at:', new Date().toISOString());

    try {
        const usersCollection = await getUsersCollection();
        const currentYear = new Date().getFullYear();

        const users = await usersCollection.find({
            notificationsEnabled: true,
            pushSubscription: { $exists: true, $ne: null },
        }).toArray();

        context.log(`Found ${users.length} active users to check`);

        if (users.length === 0) {
            return;
        }

        const BATCH_SIZE = 100;
        const batches = [];

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            batches.push(users.slice(i, i + BATCH_SIZE));
        }

        let totalNotificationsSent = 0;
        let totalExpiredSubscriptions = 0;

        for (const batch of batches) {
            const notificationsToSend = [];
            const usersToUpdate = [];

            for (const user of batch) {
                try {
                    const currentPercent = calculateYearProgress(user.timezone, currentYear);

                    if (currentPercent > user.lastNotifiedPercent && currentPercent <= 100) {
                        notificationsToSend.push({
                            userId: user._id.toString(),
                            subscription: user.pushSubscription,
                            percent: currentPercent,
                        });

                        usersToUpdate.push({
                            userId: user._id,
                            newPercent: currentPercent,
                        });
                    }
                } catch (error) {
                    context.log(`Error processing user ${user._id}:`, error.message);
                }
            }

            if (notificationsToSend.length > 0) {
                context.log(`Sending ${notificationsToSend.length} notifications in this batch`);

                const results = await sendBatchNotifications(notificationsToSend);

                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const userUpdate = usersToUpdate[i];

                    if (result.success) {
                        await usersCollection.updateOne(
                            { _id: userUpdate.userId },
                            {
                                $set: {
                                    lastNotifiedPercent: userUpdate.newPercent,
                                    updatedAt: new Date(),
                                },
                            }
                        );
                        totalNotificationsSent++;
                    } else if (result.expired) {
                        await usersCollection.updateOne(
                            { _id: userUpdate.userId },
                            {
                                $set: {
                                    pushSubscription: null,
                                    notificationsEnabled: false,
                                    updatedAt: new Date(),
                                },
                            }
                        );
                        totalExpiredSubscriptions++;
                        context.log(`Removed expired subscription for user ${result.userId}`);
                    } else {
                        context.log(`Failed to send notification to user ${result.userId}:`, result.error);
                    }
                }
            }
        }

        context.log(`Year progress check completed. Sent: ${totalNotificationsSent}, Expired: ${totalExpiredSubscriptions}`);
    } catch (error) {
        context.log('Error in checkYearProgress:', error);
        throw error;
    }
}

module.exports = { checkYearProgress };
