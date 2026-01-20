// Custom push notification handler for Workbox service worker
// This file is imported by the Workbox-generated service worker

self.addEventListener('push', (event) => {
    console.log('[sw-push.js] Push event received:', event);

    if (!event.data) {
        console.log('[sw-push.js] No data in push event');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[sw-push.js] Push data:', data);

        const { title, body, icon, badge, tag, data: notificationData } = data;

        const options = {
            body,
            icon: icon || '/icons/icon-192x192.png',
            badge: badge || '/icons/badge-96x96.png',
            tag: tag || 'gone-notification',
            requireInteraction: false,
            data: notificationData,
            vibrate: [200, 100, 200],
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('[sw-push.js] Error parsing push notification:', error);
        // Show a fallback notification
        event.waitUntil(
            self.registration.showNotification('Gone', {
                body: 'Year progress update',
                icon: '/icons/icon-192x192.png',
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    console.log('[sw-push.js] Notification clicked');
    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

console.log('[sw-push.js] Push notification handler loaded');
