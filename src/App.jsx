import React, { useState, useEffect } from 'react';
import ScheduleView from './components/ScheduleView';
import AddEventView from './components/AddEventView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import PomodoroView from './components/PomodoroView';
import { authService } from './services/auth';
import { backupService } from './services/backup';
import { initAudio } from './utils/sound';
import { Toaster, toast } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, queueSync } from './services/db';
import { syncService } from './services/sync';
import { notificationManager } from './services/notificationManager';
import { Upload, X, AlertTriangle } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div role="alert" className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            <p>Something went wrong:</p>
            <pre className="text-sm mt-2">{error.message}</pre>
            <button onClick={resetErrorBoundary} className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700">Try again</button>
        </div>
    );
}

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('schedule'); // 'schedule', 'add', 'settings', 'pomodoro', 'login'
    const [viewHistory, setViewHistory] = useState(['schedule']);
    const [editingItem, setEditingItem] = useState(null);

    const [theme, setTheme] = useState({ mode: 'dark', primary: '#00bcd4' });

    // Live Queries for Data
    const events = useLiveQuery(() => db.items.where('category').equals('event').filter(i => !i.deleted).toArray()) || [];
    const tasks = useLiveQuery(() => db.items.where('category').equals('task').filter(i => !i.deleted).toArray()) || [];
    const habits = useLiveQuery(() => db.items.where('category').equals('habit').filter(i => !i.deleted).toArray()) || [];

    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('app-preferences');
        return saved ? JSON.parse(saved) : {
            notifications: {
                local: true,
                web: true
            },
            sound: true,
            reminderTone: '/sounds/new-notification-1-398650.mp3',
            defaultView: 'daily'
        };
    });

    const [showImportModal, setShowImportModal] = useState(false);
    const [importJson, setImportJson] = useState('');

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const saved = localStorage.getItem('app-current-user');
        if (saved) {
            try {
                setCurrentUser(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }
    }, []);

    useEffect(() => {
        initAudio();
    }, []);

    useEffect(() => {
        localStorage.setItem('app-preferences', JSON.stringify(preferences));
    }, [preferences]);

    // Listen for Auth Changes
    useEffect(() => {
        const { data: subscription } = authService.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                setCurrentUser(session.user);
                localStorage.setItem('app-current-user', JSON.stringify(session.user));
                syncService.sync();
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                localStorage.removeItem('app-current-user');
            }
        });

        return () => subscription?.subscription?.unsubscribe();
    }, []);

    // Listen for Deep Links (Google Auth)
    useEffect(() => {
        import('@capacitor/app').then(({ App }) => {
            App.addListener('appUrlOpen', async (data) => {
                console.log('App opened with URL:', data.url);
                try {
                    const url = new URL(data.url);
                    // Check if it's our auth callback
                    if (url.host === 'google-auth' && url.hash) {
                        const params = new URLSearchParams(url.hash.substring(1));
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');

                        if (access_token && refresh_token) {
                            await import('./services/supabase').then(m => m.supabase.auth.setSession({
                                access_token,
                                refresh_token
                            }));
                            toast.success('Successfully signed in with Google!');
                        }
                    }
                } catch (e) {
                    console.error('Error handling deep link:', e);
                }
            });
        });
    }, []);

    // Listen for Notification Triggers (from notifications.js)
    useEffect(() => {
        const handleNotificationTrigger = (event) => {
            const { title, body, soundPath } = event.detail;
            console.log('App received notification trigger:', title);

            // Show Toast with beautiful styling - display title + body
            const displayMessage = title ? `${title}\n${body}` : body;

            toast(displayMessage, {
                icon: '🔔',
                duration: 6000,
                style: {
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 188, 212, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 188, 212, 0.2)',
                    fontWeight: '500',
                    fontSize: '15px',
                    maxWidth: '400px',
                    whiteSpace: 'pre-line',
                },
                iconTheme: {
                    primary: '#00bcd4',
                    secondary: '#ffffff',
                },
            });

            // Sound is played by notificationManager
        };

        window.addEventListener('trigger-notification', handleNotificationTrigger);
        return () => window.removeEventListener('trigger-notification', handleNotificationTrigger);
    }, []);

    // Periodic Sync
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(() => {
            syncService.sync();
        }, 60000); // Sync every minute
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleLogin = (user) => {
        setCurrentUser(user);
        localStorage.setItem('app-current-user', JSON.stringify(user));
        setCurrentView('schedule');
        syncService.sync();
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setCurrentUser(null);
            localStorage.removeItem('app-current-user');
            setCurrentView('login');
        }
    };

    const [scheduleActiveTab, setScheduleActiveTab] = useState('schedule');

    const handleNavigate = (view, data = null) => {
        if (view === 'add' && data) {
            setEditingItem(data);
        } else if (view === 'add') {
            setEditingItem(null);
        }

        // If navigating to add from assignments, ensure we return to assignments
        if (view === 'add' && scheduleActiveTab === 'assignments') {
            // No specific action needed as state is preserved, but good to note intent
        }

        setViewHistory(prev => [...prev, view]);
        setCurrentView(view);
    };

    const handleBack = () => {
        if (viewHistory.length > 1) {
            const newHistory = [...viewHistory];
            newHistory.pop(); // Remove current
            const prevView = newHistory[newHistory.length - 1];
            setViewHistory(newHistory);
            setCurrentView(prevView);
        } else {
            setCurrentView('schedule');
        }
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            await db.items.update(updatedTask.id, updatedTask);
            await queueSync('update', updatedTask);
            await syncService.sync();
            toast.success('Task updated');
        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await db.items.update(id, { deleted: true, deletedAt: new Date().toISOString() });
            await queueSync('delete', { id });
            await notificationManager.cancel(id);
            await syncService.sync();
            toast.success('Event deleted');
            handleBack();
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast.error('Failed to delete event');
        }
    };

    const handleImportData = async (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.events && !data.tasks && !data.habits) throw new Error('Invalid data format');

            // 1. Clear existing data
            await db.items.clear();

            // 2. Prepare new items
            const newItems = [];
            if (data.events && Array.isArray(data.events)) newItems.push(...data.events);
            if (data.tasks && Array.isArray(data.tasks)) newItems.push(...data.tasks);
            if (data.habits && Array.isArray(data.habits)) newItems.push(...data.habits);

            // 3. Bulk add
            if (newItems.length > 0) {
                await db.items.bulkAdd(newItems);
            }

            // 4. Update preferences if present
            if (data.preferences) {
                setPreferences(data.preferences);
            }

            // 5. Sync
            await syncService.sync();

            toast.success('Data imported successfully');
            setShowImportModal(false);

            // Reload to reflect changes cleanly
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Import failed: ' + error.message);
        }
    };

    const handleSaveEvent = async (formData) => {
        console.log('handleSaveEvent called with:', JSON.stringify(formData, null, 2));
        try {
            let itemId = formData.id;

            if (itemId) {
                // Update existing
                await db.items.update(itemId, formData);
                await queueSync('update', formData);
                // Cancel existing notification
                await notificationManager.cancel(itemId);
                toast.success('Item updated successfully');
            } else {
                // Create new
                itemId = crypto.randomUUID();
                const newItem = {
                    ...formData,
                    id: itemId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await db.items.add(newItem);
                await queueSync('add', newItem);
                toast.success('Item created successfully');
            }

            // Schedule Notification if it's an event
            if (formData.category === 'event' && formData.startTime) {
                const [hours, minutes] = formData.startTime.split(':').map(Number);
                let eventDate = new Date();
                eventDate.setHours(hours, minutes, 0, 0);

                // Calculate date based on repeat type
                if (formData.repeat === 'Weekly' && formData.repeatDay) {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const targetDay = days.indexOf(formData.repeatDay);

                    if (targetDay !== -1) {
                        // If today is the day and time hasn't passed, use today.
                        // Otherwise, find next.
                        if (eventDate.getDay() !== targetDay || eventDate <= new Date()) {
                            let daysToAdd = (targetDay - eventDate.getDay() + 7) % 7;
                            if (daysToAdd === 0) daysToAdd = 7; // If today but passed, next week
                            eventDate.setDate(eventDate.getDate() + daysToAdd);
                        }
                    }
                } else if (formData.repeat === 'Daily') {
                    if (eventDate <= new Date()) {
                        eventDate.setDate(eventDate.getDate() + 1);
                    }
                } else if (formData.repeat === 'Never' && formData.date) {
                    // Use specific date
                    eventDate = new Date(formData.date);
                    eventDate.setHours(hours, minutes, 0, 0);
                }

                // Ensure date is in the future
                console.log('Scheduling event notification. Event Date:', eventDate, 'Now:', new Date());

                // Helper function to format time to 12hr
                const formatTime12hr = (time24) => {
                    const [hours, minutes] = time24.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12;
                    return `${hour12}:${minutes} ${ampm}`;
                };

                // 1. Schedule Main Event Notification (at start time)
                if (eventDate > new Date()) {
                    console.log('Event is in the future, calling notificationManager.schedule');
                    notificationManager.schedule(
                        itemId,
                        `📚 ${formData.subject}`,
                        `Starting now at ${formatTime12hr(formData.startTime)}`,
                        eventDate,
                        preferences.reminderTone
                    );
                } else {
                    console.warn('Event date is in the past, not scheduling main notification.');
                }

                // 2. Schedule Reminders (X minutes before)
                if (formData.reminders && formData.reminders.length > 0) {
                    console.log('Scheduling reminders. Count:', formData.reminders.length);
                    formData.reminders.forEach((reminder, index) => {
                        console.log(`Processing reminder [${index}]:`, JSON.stringify(reminder));

                        // Calculate reminder time: Event Time - Reminder Minutes
                        const reminderMinutes = parseInt(reminder.time, 10);
                        const reminderTime = new Date(eventDate.getTime() - reminderMinutes * 60000);

                        console.log(`Calculated Reminder Time: ${reminderTime.toLocaleString()} (Offset: ${reminderMinutes} mins)`);

                        // Allow scheduling if it's in the future OR within the last 60 seconds (grace period)
                        const now = new Date();
                        const gracePeriod = 60 * 1000; // 60 seconds

                        if (reminderTime > new Date(now.getTime() - gracePeriod)) {
                            console.log(`Scheduling reminder: ${reminder.label} at ${reminderTime}`);

                            // Create a better message with 12hr format
                            const timeUntil = Math.round((eventDate.getTime() - reminderTime.getTime()) / 60000);
                            const formattedTime = formatTime12hr(formData.startTime);
                            const message = `${formData.subject} starts in ${timeUntil} minute${timeUntil !== 1 ? 's' : ''} at ${formattedTime}`;

                            notificationManager.schedule(
                                `${itemId}-reminder-${index}`, // Unique ID for reminder
                                `⏰ Upcoming Event`,
                                message,
                                reminderTime,
                                preferences.reminderTone
                            );
                        } else {
                            console.warn(`Reminder time ${reminderTime} is too far in the past, skipping.`);
                        }
                    });
                }
            }

            await syncService.sync();
            handleBack();
        } catch (error) {
            console.error('Failed to save item:', error);
            toast.error('Failed to save item');
        }
    };



    const renderView = () => {
        if (!currentUser) return <LoginView onLogin={handleLogin} />;

        switch (currentView) {
            case 'schedule':
                return (
                    <ScheduleView
                        events={events}
                        tasks={tasks}
                        habits={habits}
                        preferences={preferences}
                        onUpdateTask={handleUpdateTask}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        viewMode={preferences.defaultView}
                        onViewModeChange={(mode) => setPreferences(prev => ({ ...prev, defaultView: mode }))}
                        onDeleteEvent={handleDeleteEvent}
                        onAddClick={() => handleNavigate('add')}
                        onSettingsClick={() => handleNavigate('settings')}
                        onPomodoroClick={() => handleNavigate('pomodoro')}
                        onEventClick={(event) => handleNavigate('add', event)}
                        activeTab={scheduleActiveTab}
                        onTabChange={setScheduleActiveTab}
                    />
                );
            case 'add':
                return (
                    <AddEventView
                        onBack={handleBack}
                        onAdd={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        initialData={editingItem}
                        currentDate={currentDate}
                    />
                );
            case 'settings':
                return (
                    <SettingsView
                        preferences={preferences}
                        onUpdatePreferences={setPreferences}
                        theme={theme}
                        onUpdateTheme={setTheme}
                        onExport={() => {
                            const data = { events, tasks, habits };
                            navigator.clipboard.writeText(JSON.stringify(data));
                            toast.success('Data copied to clipboard');
                        }}
                        onImport={() => setShowImportModal(true)}
                        onBack={handleBack}
                    />
                );
            case 'pomodoro':
                return (
                    <PomodoroView
                        onBack={handleBack}
                    />
                );
            default:
                return <ScheduleView
                    events={events}
                    tasks={tasks}
                    habits={habits}
                    preferences={preferences}
                    onUpdateTask={handleUpdateTask}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    viewMode={preferences.defaultView}
                    onViewModeChange={(mode) => setPreferences(prev => ({ ...prev, defaultView: mode }))}
                    onDeleteEvent={handleDeleteEvent}
                    onAddClick={(data) => handleNavigate('add', data)}
                    onSettingsClick={() => handleNavigate('settings')}
                    onPomodoroClick={() => handleNavigate('pomodoro')}
                    onEventClick={(event) => handleNavigate('add', event)}
                    activeTab={scheduleActiveTab}
                    onTabChange={setScheduleActiveTab}
                />;
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="min-h-screen bg-black text-textMain flex justify-center">
                <div className="w-full max-w-md relative bg-background h-[100dvh] shadow-2xl shadow-black overflow-hidden flex flex-col">
                    <Toaster position="top-center" toastOptions={{
                        style: {
                            background: '#1E1E1E',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                        },
                    }} />
                    {renderView()}

                    {/* Import Modal */}
                    {showImportModal && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                            <div className="bg-[#1e293b] border border-white/10 rounded-3xl w-[90%] max-w-md shadow-2xl overflow-hidden animate-scale-in">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent ring-1 ring-accent/20">
                                            <Upload size={20} />
                                        </div>
                                        <h3 className="text-xl font-black text-white tracking-tight">Import Backup</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors active:scale-95"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Warning Alert */}
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                                        <div className="text-yellow-500 mt-0.5">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-yellow-500">Warning: Overwrite Risk</p>
                                            <p className="text-xs text-yellow-500/80 leading-relaxed">Importing data will completely replace your current schedule. This action cannot be undone.</p>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-textMuted uppercase tracking-widest ml-1">Paste Data JSON</label>
                                        <textarea
                                            value={importJson}
                                            onChange={(e) => setImportJson(e.target.value)}
                                            placeholder='{"version": 1, "events": [...]}'
                                            className="w-full h-40 bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white text-sm font-mono focus:outline-none focus:border-accent/50 transition-colors resize-none placeholder-white/20"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setShowImportModal(false)}
                                            className="px-5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleImportData(importJson)}
                                            className="px-6 py-2.5 rounded-xl text-black font-bold shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all text-sm active:scale-95 bg-accent"
                                        >
                                            Import Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default App;
