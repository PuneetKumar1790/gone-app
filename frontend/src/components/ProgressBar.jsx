import React from 'react';

/**
 * Minimal progress bar component
 */
export default function ProgressBar({ percent }) {
    return (
        <div className="w-full">
            <div className="h-2 bg-gone-gray w-full">
                <div
                    className="h-full bg-gone-white transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                />
            </div>
        </div>
    );
}
