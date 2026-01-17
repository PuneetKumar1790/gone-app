const { app } = require('@azure/functions');

// Import all function handlers
const { checkYearProgress } = require('./checkYearProgress/handler');
const { getCurrentProgress } = require('./getCurrentProgress/handler');
const { registerPushSubscription } = require('./registerPushSubscription/handler');
const { updateSettings } = require('./updateSettings/handler');

// Register all functions at startup
app.timer('checkYearProgress', {
    schedule: '0 0 * * * *',
    handler: checkYearProgress,
});

app.http('getCurrentProgress', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'progress',
    handler: getCurrentProgress,
});

app.http('registerPushSubscription', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'subscribe',
    handler: registerPushSubscription,
});

app.http('updateSettings', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'settings',
    handler: updateSettings,
});
