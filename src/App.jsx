import React, { useState, useEffect } from 'react';
import ScheduleView from './components/ScheduleView';
import AddEventView from './components/AddEventView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import { Capacitor } from '@capacitor/core';
import { playNotificationSound, initAudio } from './utils/sound';
import { scheduleNotification } from './utils/notifications';
import { getNextOccurrence } from './utils/time';

const DEFAULT_THEME = { name: 'Teal', primary: '#4db6ac', bg: '#121212', card: '#1e1e1e', cardLight: '#2c2c2c' };

function App() {
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('app-current-user'));
    const [currentView, setCurrentView] = useState('schedule'); // 'schedule' | 'add' | 'settings'
    const [events, setEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [theme, setTheme] = useState(DEFAULT_THEME);

    // Load user data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            // Load theme
            const savedTheme = localStorage.getItem(`app-theme-${currentUser}`);
            setTheme(savedTheme ? JSON.parse(savedTheme) : DEFAULT_THEME);

            // Load events
            const savedEvents = localStorage.getItem(`app-events-${currentUser}`);
            setEvents(savedEvents ? JSON.parse(savedEvents) : []);
        } else {
            setTheme(DEFAULT_THEME);
            setEvents([]);
        }
    }, [currentUser]);

    // Save events whenever they change
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`app-events-${currentUser}`, JSON.stringify(events));

            // Schedule Native Notifications (Android)
            if (Capacitor.isNativePlatform()) {
                events.forEach(event => {
                    const nextDate = getNextOccurrence(event);
                    if (nextDate && event.reminders) {
                        event.reminders.forEach(reminder => {
                            const offset = typeof reminder === 'object' ? reminder.value : 0;
                            const triggerTime = new Date(nextDate.getTime() - offset * 60000);

                            if (triggerTime > new Date()) {
                                // Generate a safe 32-bit integer ID
                                const safeId = (event.id + offset) % 2147483647;
                                scheduleNotification(
                                    safeId,
                                    `Reminder: ${event.subject}`,
                                    `Starts in ${offset} minutes at ${event.building || 'Class'}`,
                                    triggerTime
                                );
                            }
                        });
                    }
                });
            }
        }
    }, [events, currentUser]);

    // Apply theme to CSS variables and save to localStorage
    useEffect(() => {
        if (currentUser) {
            const root = document.documentElement;
            root.style.setProperty('--color-background', theme.bg);
            root.style.setProperty('--color-card', theme.card);
            root.style.setProperty('--color-accent', theme.primary);
            root.style.setProperty('--color-card-light', theme.cardLight || theme.card);

            localStorage.setItem(`app-theme-${currentUser}`, JSON.stringify(theme));
        }
    }, [theme, currentUser]);

    // Check reminders (Web Polling & In-App Sound)
    useEffect(() => {
        if (!currentUser) return;

        const checkReminders = () => {
            const now = new Date();
            const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

            events.forEach(event => {
                // Check if event is today
                if (event.repeat === 'Daily' || (event.repeat === 'Weekly' && event.repeatDay === currentDayName) || event.repeatDay === currentDayName) {
                    if (event.startTime && event.reminders) {
                        const [hours, minutes] = event.startTime.split(':').map(Number);
                        const eventTime = new Date();
                        eventTime.setHours(hours, minutes, 0, 0);

                        event.reminders.forEach(reminder => {
                            // Handle both old string format and new object format
                            const offset = typeof reminder === 'object' ? reminder.value : 0;

                            const triggerTime = new Date(eventTime.getTime() - offset * 60000);

                            // Check if now is within the same minute as trigger time
                            if (now.getHours() === triggerTime.getHours() && now.getMinutes() === triggerTime.getMinutes() && now.getSeconds() === 0) {
                                playNotificationSound();

                                // Only show Web Notification if NOT native (Native handles it via scheduling)
                                if (!Capacitor.isNativePlatform()) {
                                    if (Notification.permission === 'granted') {
                                        if ('serviceWorker' in navigator) {
                                            navigator.serviceWorker.ready.then(registration => {
                                                registration.showNotification(`Reminder: ${event.subject}`, {
                                                    body: `Starts in ${offset} minutes at ${event.building || 'Class'}`,
                                                    icon: '/vite.svg', // Optional icon
                                                    vibrate: [200, 100, 200],
                                                    requireInteraction: true,
                                                    tag: `reminder-${event.id}-${triggerTime.getTime()}` // Prevent duplicate notifications
                                                });
                                            });
                                        } else {
                                            new Notification(`Reminder: ${event.subject}`, {
                                                body: `Starts in ${offset} minutes at ${event.building || 'Class'}`
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 1000);

        if (Notification.permission === 'default' && !Capacitor.isNativePlatform()) {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [events, currentUser]);

    const handleLogin = (username) => {
        setCurrentUser(username);
        localStorage.setItem('app-current-user', username);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('app-current-user');
        setCurrentView('schedule');
    };

    const handleAddEvent = (newEvent) => {
        if (editingEvent) {
            setEvents(events.map(e => e === editingEvent ? { ...newEvent, id: editingEvent.id || Date.now() } : e));
            setEditingEvent(null);
        } else {
            setEvents([...events, { ...newEvent, id: Date.now() }]);
        }
        setCurrentView('schedule');
    };

    const handleDeleteEvent = (eventToDelete) => {
        setEvents(events.filter(e => e !== eventToDelete));
        if (editingEvent === eventToDelete) {
            setEditingEvent(null);
        }
    };

    const handleEventClick = (event) => {
        setEditingEvent(event);
        setCurrentView('add');
    };

    // Initialize audio context on first user interaction
    useEffect(() => {
        const handleInteraction = () => {
            initAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    if (!currentUser) {
        return <LoginView onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-background text-textMain flex justify-center transition-colors duration-300">
            {/* Mobile container constraint */}
            <div className="w-full max-w-md relative bg-background min-h-screen shadow-2xl overflow-hidden transition-colors duration-300">
                {currentView === 'schedule' && (
                    <ScheduleView
                        events={events}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onAddClick={() => {
                            setEditingEvent(null);
                            setCurrentView('add');
                        }}
                        onSettingsClick={() => setCurrentView('settings')}
                        onEventClick={handleEventClick}
                        onDeleteEvent={handleDeleteEvent}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                    />
                )}
                {currentView === 'add' && (
                    <AddEventView
                        onClose={() => {
                            setEditingEvent(null);
                            setCurrentView('schedule');
                        }}
                        onAdd={handleAddEvent}
                        onDelete={handleDeleteEvent}
                        initialData={editingEvent}
                    />
                )}
                {currentView === 'settings' && (
                    <SettingsView
                        currentTheme={theme}
                        onThemeChange={setTheme}
                        onClose={() => setCurrentView('schedule')}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
