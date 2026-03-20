import React from 'react';
import ProgressBar from './ProgressBar';
import { formatPercent, formatDays } from '../utils/dateCalculations';

/**
 * Dashboard - displays year progress
 */
export default function Dashboard({ progressData, onOpenSettings }) {
    if (!progressData) {
        return (
            <div className="text-center text-gone-gray">
                <p>Loading...</p>
            </div>
        );
    }

    const {
        year,
        percentComplete,
        percentRemaining,
        daysPassed,
        daysRemaining,
        nextNotificationAt,
    } = progressData;

    return (
        <div className="w-full max-w-4xl px-4 space-y-12">
            {/* Main metric */}
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <div className="text-8xl font-light tracking-tight">
                        {formatPercent(percentComplete)}
                    </div>
                    <div className="text-2xl text-gone-light-gray font-light">
                        of {year} is gone
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-8">
                    <ProgressBar percent={percentComplete} />
                </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-8 text-center">
                <div className="space-y-1">
                    <div className="text-3xl font-light text-gone-white">
                        {formatPercent(percentRemaining)}
                    </div>
                    <div className="text-sm text-gone-gray">Remaining</div>
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-light text-gone-white">
                        {formatDays(daysPassed)}
                    </div>
                    <div className="text-sm text-gone-gray">Days Passed</div>
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-light text-gone-white">
                        {formatDays(daysRemaining)}
                    </div>
                    <div className="text-sm text-gone-gray">Days Remaining</div>
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-light text-gone-white">
                        {formatPercent(nextNotificationAt)}
                    </div>
                    <div className="text-sm text-gone-gray">Next Notification</div>
                </div>
            </div>

            {/* Settings button */}
            <div className="text-center pt-8">
                <button
                    onClick={onOpenSettings}
                    className="text-gone-gray hover:text-gone-white transition-colors text-sm underline"
                >
                    Settings
                </button>
            </div>
        </div>
    );
}
