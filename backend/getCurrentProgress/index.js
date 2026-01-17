const { getYearProgressData } = require('../shared/yearProgress');

module.exports = async function (context, req) {
    context.log('getCurrentProgress invoked');

    try {
        const timezone = (req.query.timezone || 'UTC');
        const currentYear = new Date().getFullYear();

        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        } catch (error) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid timezone',
                    message: 'Please provide a valid IANA timezone (e.g., Asia/Kolkata)',
                }),
            };
            return;
        }

        const progressData = getYearProgressData(timezone, currentYear);

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            body: JSON.stringify(progressData),
        };
    } catch (error) {
        context.log('Error in getCurrentProgress:', error);
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
