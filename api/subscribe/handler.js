const { getUsersCollection } = require("../shared/database");
const { calculateYearProgress } = require("../shared/yearProgress");

/**
 * HTTP handler: Register push subscription
 */
async function registerPushSubscription(request, context) {
  context.log("registerPushSubscription invoked");

  try {
    // Get request body (v3 model has it as request.body)
    const body = request.body || {};
    const { subscription, timezone } = body;
    context.log("Request data:", { hasSubscription: !!subscription, timezone });

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid request",
          message: "Subscription object is required with endpoint and keys",
        }),
      };
    }

    if (!timezone) {
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid request",
          message: "Timezone is required",
        }),
      };
    }

    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch (error) {
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid timezone",
          message: "Please provide a valid IANA timezone",
        }),
      };
    }

    const currentYear = new Date().getFullYear();
    const currentPercent = calculateYearProgress(timezone, currentYear);

    context.log("Attempting to connect to MongoDB...");
    const usersCollection = await getUsersCollection();
    context.log("Successfully connected to MongoDB");

    const existingUser = await usersCollection.findOne({
      "pushSubscription.endpoint": subscription.endpoint,
    });

    if (existingUser) {
      await usersCollection.updateOne(
        { "pushSubscription.endpoint": subscription.endpoint },
        {
          $set: {
            timezone,
            year: currentYear,
            lastNotifiedPercent: currentPercent,
            pushSubscription: subscription,
            notificationsEnabled: true,
            updatedAt: new Date(),
          },
        },
      );

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Subscription updated successfully",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Subscription registered successfully",
          currentPercent,
        }),
      };
    }
  } catch (error) {
    context.log("Error in registerPushSubscription:", error);
    context.log("Error name:", error.name);
    context.log("Error message:", error.message);
    context.log("Error stack:", error.stack);

    return {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
        errorName: error.name,
      }),
    };
  }
}

module.exports = { registerPushSubscription };
