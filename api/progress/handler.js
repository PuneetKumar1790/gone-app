const { getYearProgressData } = require("../shared/yearProgress");

/**
 * HTTP handler: Get current year progress
 */
async function getCurrentProgress(request, context) {
  context.log("getCurrentProgress invoked");

  try {
    const timezone = request.query.timezone || "UTC";
    const currentYear = new Date().getFullYear();

    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch (error) {
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid timezone",
          message: "Please provide a valid IANA timezone (e.g., Asia/Kolkata)",
        }),
      };
    }

    const progressData = getYearProgressData(timezone, currentYear);

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify(progressData),
    };
  } catch (error) {
    context.log("Error in getCurrentProgress:", error);
    return {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
}

module.exports = { getCurrentProgress };
