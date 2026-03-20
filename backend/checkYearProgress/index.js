const { checkYearProgress } = require("./handler");

module.exports = async function (context, myTimer) {
  // Call the v4-style handler
  await checkYearProgress(myTimer, context);
};
