import React, { useState } from 'react';
import { updateSettings } from '../services/api';
import { getUserTimezone } from '../utils/dateCalculations';

/**
 * Settings panel
 */
export default function Settings({ subscription, onClose, onSettingsUpdate }) {
    const [timezone, setTimezone] = useState(getUserTimezone());
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!subscription) {
            setError('No subscription found');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await updateSettings(subscription.endpoint, {
                timezone,
                notificationsEnabled,
            });

            setSuccess(true);
            onSettingsUpdate();

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gone-black bg-opacity-95 flex items-center justify-center p-4 z-50">
            <div className="bg-gone-black border border-gone-gray max-w-md w-full p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-light">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gone-gray hover:text-gone-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Timezone */}
                    <div className="space-y-2">
                        <label className="block text-sm text-gone-gray">Timezone</label>
                        <input
                            type="text"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full bg-transparent border border-gone-gray px-3 py-2 text-gone-white focus:outline-none focus:border-gone-white"
                            placeholder="Asia/Kolkata"
                        />
                        <p className="text-xs text-gone-gray">IANA timezone format</p>
                    </div>

                    {/* Notifications toggle */}
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gone-gray">Notifications</span>
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-gone-white' : 'bg-gone-gray'
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-gone-black transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Error/Success messages */}
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-500">Settings saved</p>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-gone-white text-gone-black hover:bg-gone-light-gray transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gone-gray text-gone-white hover:bg-gone-gray transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
