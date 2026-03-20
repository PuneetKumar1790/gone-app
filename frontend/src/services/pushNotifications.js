import { registerSubscription } from "./api.js";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Detect if the browser is Brave
 */
function isBraveBrowser() {
  return navigator.brave && typeof navigator.brave.isBrave === "function";
}

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Subscribe to push notifications
 * @param {string} timezone - User's timezone
 * @returns {Promise<object>} - Subscription object
 */
export async function subscribeToPush(timezone) {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID public key is not configured");
  }

  // Check for Brave browser
  if (isBraveBrowser()) {
    try {
      const isBrave = await navigator.brave.isBrave();
      if (isBrave) {
        // Brave requires notifications to be enabled in settings
        console.warn(
          "Brave browser detected. Push notifications may require additional setup.",
        );
      }
    } catch (e) {
      console.warn("Could not determine if browser is Brave", e);
    }
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // Register with backend
    const result = await registerSubscription(subscription.toJSON(), timezone);

    return { subscription, result };
  } catch (error) {
    // Handle Brave-specific errors
    if (isBraveBrowser()) {
      throw new Error(
        "Brave browser blocks standard push notifications. Please enable notifications in Brave Settings → Shields → Allow notifications from this site, or use Chrome/Firefox.",
      );
    }
    throw error;
  }
}

/**
 * Get current subscription
 */
export async function getCurrentSubscription() {
  if (!isPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
}
