import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { getCurrentProgress } from './services/api';
import {
    isPushSupported,
    requestNotificationPermission,
    subscribeToPush,
    getCurrentSubscription,
} from './services/pushNotifications';
import { getUserTimezone } from './utils/dateCalculations';
import './index.css';

function App() {
    const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
    const [progressData, setProgressData] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState(null);

    // Load progress data
    const loadProgress = async () => {
        try {
            const timezone = getUserTimezone();
            const data = await getCurrentProgress(timezone);
            setProgressData(data);
        } catch (err) {
            console.error('Failed to load progress:', err);
            setError(err.message);
        }
    };

    // Check for existing subscription on mount
    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const existingSub = await getCurrentSubscription();
                if (existingSub) {
                    setSubscription(existingSub.toJSON());
                    setView('dashboard');
                    await loadProgress();
                }
            } catch (err) {
                console.error('Failed to check subscription:', err);
            }
        };

        checkSubscription();
    }, []);

    // Refresh progress data periodically
    useEffect(() => {
        if (view === 'dashboard') {
            const interval = setInterval(loadProgress, 60000); // Every minute
            return () => clearInterval(interval);
        }
    }, [view]);

    const handleEnableNotifications = async () => {
        try {
            setError(null);

            // Check support
            if (!isPushSupported()) {
                setError('Push notifications are not supported in this browser');
                return;
            }

            // Request permission
            const granted = await requestNotificationPermission();
            if (!granted) {
                setError('Notification permission denied');
                return;
            }

            // Subscribe to push
            const timezone = getUserTimezone();
            const { subscription: sub } = await subscribeToPush(timezone);

            setSubscription(sub.toJSON());
            setView('dashboard');
            await loadProgress();
        } catch (err) {
            console.error('Failed to enable notifications:', err);
            setError(err.message);
        }
    };

    const handleSettingsUpdate = async () => {
        await loadProgress();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {view === 'landing' && (
                <div className="space-y-6">
                    <Landing onEnableNotifications={handleEnableNotifications} />
                    {error && (
                        <p className="text-center text-sm text-red-500">{error}</p>
                    )}
                </div>
            )}

            {view === 'dashboard' && (
                <>
                    <Dashboard
                        progressData={progressData}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                    {showSettings && (
                        <Settings
                            subscription={subscription}
                            onClose={() => setShowSettings(false)}
                            onSettingsUpdate={handleSettingsUpdate}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;
