import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleNotification = async (id, title, body, scheduleDate) => {
    if (Capacitor.isNativePlatform()) {
        // Native (Android/iOS)
        try {
            // Request permissions first
            const permStatus = await LocalNotifications.requestPermissions();
            if (permStatus.display === 'granted') {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: title,
                            body: body,
                            id: id, // Must be an integer
                            schedule: { at: scheduleDate },
                            sound: 'beep.wav', // Optional, uses default if not found
                            actionTypeId: '',
                            extra: null
                        }
                    ]
                });
                console.log('Native notification scheduled for:', scheduleDate);
            }
        } catch (error) {
            console.error('Error scheduling native notification:', error);
        }
    } else {
        // Web Fallback (Service Worker or standard Notification API)
        if (Notification.permission === 'granted') {
            // Calculate delay in milliseconds
            const now = new Date();
            const delay = scheduleDate.getTime() - now.getTime();

            if (delay > 0) {
                setTimeout(() => {
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification(title, {
                                body: body,
                                icon: '/app-icon.jpg',
                                vibrate: [200, 100, 200],
                                requireInteraction: true,
                                tag: `reminder-${id}`
                            });
                        });
                    } else {
                        new Notification(title, {
                            body: body,
                            icon: '/app-icon.jpg'
                        });
                    }
                }, delay);
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
};

export const cancelNotification = async (id) => {
    if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({ notifications: [{ id: id }] });
    } else {
        // Web doesn't have a standard "cancel scheduled" without a custom SW implementation
        // For now, we rely on the fact that web uses setTimeout which clears on page reload
        // Or we could track timeout IDs if strictly necessary, but for this MVP it's acceptable.
    }
};
