import React, { useState, useEffect } from 'react';
import ScheduleView from './components/ScheduleView';
import AddEventView from './components/AddEventView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import InstallPrompt from './components/InstallPrompt';
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
    const [initialTab, setInitialTab] = useState('details');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [theme, setTheme] = useState(DEFAULT_THEME);

    // ... (keep existing useEffects)

    const handleEventClick = (event, tab = 'details') => {
        setEditingEvent(event);
        setInitialTab(tab);
        setCurrentView('add');
    };

    // ... (keep existing useEffects)

    // ... (inside render)
    {
        currentView === 'add' && (
            <AddEventView
                onClose={() => {
                    setEditingEvent(null);
                    setCurrentView('schedule');
                }}
                onAdd={handleAddEvent}
                onDelete={handleDeleteEvent}
                initialData={editingEvent}
                initialTab={initialTab}
            />
        )
    }
    {
        currentView === 'settings' && (
            <SettingsView
                currentTheme={theme}
                onThemeChange={setTheme}
                onClose={() => setCurrentView('schedule')}
            />
        )
    }

    {/* Install Prompt for PWA */ }
    <InstallPrompt />
            </div >
        </div >
    );
}

export default App;
