const { registerPushSubscription } = require("./handler");

module.exports = async function (context, req) {
  // Call the v4-style handler
  const response = await registerPushSubscription(req, context);

  // Set the response on context for v3 compatibility
  context.res = {
    status: response.status,
    headers: response.headers,
    body: response.body,
  };
};
