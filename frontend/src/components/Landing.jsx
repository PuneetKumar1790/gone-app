import React from 'react';

/**
 * Landing page - minimal explanation
 */
export default function Landing({ onEnableNotifications }) {
    return (
        <div className="text-center space-y-8 px-4 max-w-2xl">
            <h1 className="text-5xl font-light tracking-tight">Gone</h1>

            <p className="text-lg text-gone-light-gray font-light">
                Track how much of the year is irreversibly gone. Get notified when each percent passes.
            </p>

            <button
                onClick={onEnableNotifications}
                className="px-8 py-3 bg-gone-white text-gone-black font-medium hover:bg-gone-light-gray transition-colors"
            >
                Enable Notifications
            </button>

            <p className="text-sm text-gone-gray">
                No social features. No gamification. Just facts.
            </p>
        </div>
    );
}
