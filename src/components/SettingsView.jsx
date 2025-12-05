import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, VolumeX, Download, Upload, RefreshCw, Bell, Globe, Check, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { playNotificationSound } from '../utils/sound';
import { notificationManager } from '../services/notificationManager';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';

const THEMES = [
    { name: 'Teal', color: '#00bcd4', id: 'teal' },
    { name: 'Blue', color: '#3b82f6', id: 'blue' },
    { name: 'Purple', color: '#a855f7', id: 'purple' },
    { name: 'Green', color: '#22c55e', id: 'green' },
    { name: 'Orange', color: '#f97316', id: 'orange' },
];

const TONES = [
    { name: 'Alynto 1', file: '/sounds/new-notification-1-398650.mp3' },
    { name: 'Alynto 2', file: '/sounds/new-notification-026-380249.mp3' },
    { name: 'Alynto 3', file: '/sounds/new-notification-3-398649.mp3' },
    { name: 'Alynto 4', file: '/sounds/new-notification-444814.mp3' },
    { name: 'Alynto 5', file: '/sounds/notification-crackle-432435.mp3' },
    { name: 'Alynto 6', file: '/sounds/notification-power-432434.mp3' },
    { name: 'Alynto 7', file: '/sounds/notification-sound-effect-372475.mp3' },
];

const SettingsView = ({ preferences, onUpdatePreferences, theme, onUpdateTheme, onExport, onImport, onBack }) => {
    const [activeSection, setActiveSection] = useState(null); // 'notifications', 'appearance', etc.

    // --- Telegram Logic ---
    const [telegramChatId, setTelegramChatId] = useState('');
    const [loadingTelegram, setLoadingTelegram] = useState(false);

    // Fetch existing chat ID on mount
    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await import('../services/supabase').then(m => m.supabase.auth.getUser());
                if (user) {
                    const { data, error } = await import('../services/supabase').then(m => m.supabase
                        .from('profiles')
                        .select('telegram_chat_id')
                        .eq('id', user.id)
                        .single()
                    );
                    if (data && data.telegram_chat_id) {
                        setTelegramChatId(data.telegram_chat_id);
                    }
                }
            } catch (e) {
                console.error('Error fetching profile:', e);
            }
        };
        fetchProfile();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleToneSelect = (type, file) => {
        onUpdatePreferences(prev => ({ ...prev, [type]: file }));
        playNotificationSound(file).catch(err => console.error("Error playing sound:", err));
    };

    const handleTestNotification = () => {
        const delay = 100; // Immediate
        notificationManager.schedule(
            'test-notification',
            "Test Notification",
            "This is a test notification from Alynto.",
            new Date(Date.now() + delay),
            preferences.reminderTone
        );
        toast.success('Test notification sent');
    };

    // Sub-page: Notifications & Sounds
    if (activeSection === 'notifications') {
        return (
            <div className="flex flex-col h-full bg-[#0f172a] animate-slide-in text-white font-sans">
                <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-[#0f172a] z-10">
                    <button
                        onClick={() => setActiveSection(null)}
                        className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Notifications & Sounds</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/5">

                        {/* Push Notifications Toggle */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${preferences.notifications?.local ? 'bg-opacity-20 text-opacity-100' : 'bg-white/5 text-white/40'}`}
                                    style={preferences.notifications?.local ? { backgroundColor: `${theme.primary}33`, color: theme.primary } : {}}>
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Push Notifications</p>
                                    <p className="text-xs text-white/40">{preferences.notifications?.local ? 'Enabled' : 'Tap to Enable'}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.notifications?.local ?? true}
                                    onChange={(e) => onUpdatePreferences(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, local: e.target.checked }
                                    }))}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                                    style={preferences.notifications?.local ? { backgroundColor: theme.primary } : {}}></div>
                            </label>
                        </div>

                        {/* Web Push Notifications Toggle */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${preferences.notifications?.web ? 'bg-opacity-20 text-opacity-100' : 'bg-white/5 text-white/40'}`}
                                    style={preferences.notifications?.web ? { backgroundColor: `${theme.primary}33`, color: theme.primary } : {}}>
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Web Push Notifications</p>
                                    <p className="text-xs text-white/40">{preferences.notifications?.web ? 'Enabled' : 'Browser notifications'}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.notifications?.web ?? true}
                                    onChange={(e) => onUpdatePreferences(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, web: e.target.checked }
                                    }))}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                                    style={preferences.notifications?.web ? { backgroundColor: theme.primary } : {}}></div>
                            </label>
                        </div>

                        {/* Test Notification Button */}
                        <div className="p-4 border-b border-white/5">
                            <button
                                onClick={handleTestNotification}
                                className="w-full text-left bg-[#0f172a] hover:bg-[#0f172a]/80 border border-white/10 rounded-lg p-3 transition-colors group"
                            >
                                <p className="font-medium text-white text-sm">Send Test Notification</p>
                                <p className="text-xs text-white/40 group-hover:text-opacity-100 transition-colors"
                                    style={{ '--hover-color': theme.primary }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
                                    onMouseLeave={(e) => e.currentTarget.style.color = ''}>Check if alerts are working</p>
                            </button>
                        </div>

                        {/* Notification Tone Grid */}
                        <div className="p-4 border-b border-white/5">
                            <h4 className="text-sm font-medium text-white mb-3">Notification Tone</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {TONES.map(tone => (
                                    <button
                                        key={tone.file}
                                        onClick={() => handleToneSelect('reminderTone', tone.file)}
                                        className={`p-3 rounded-lg text-xs font-medium text-left transition-all ${preferences.reminderTone === tone.file
                                            ? 'bg-opacity-10 text-opacity-100 border-opacity-30'
                                            : 'bg-[#0f172a] text-white/60 border border-white/5 hover:bg-white/5 hover:text-white'
                                            }`}
                                        style={preferences.reminderTone === tone.file ? {
                                            backgroundColor: `${theme.primary}1a`,
                                            color: theme.primary,
                                            borderColor: `${theme.primary}4d`
                                        } : {}}
                                    >
                                        {tone.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clutch Tone Grid */}
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-white mb-3">Timer Tone (Clutch)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {TONES.map(tone => (
                                    <button
                                        key={tone.file}
                                        onClick={() => handleToneSelect('clutchTone', tone.file)}
                                        className={`p-3 rounded-lg text-xs font-medium text-left transition-all ${preferences.clutchTone === tone.file
                                            ? 'bg-opacity-10 text-opacity-100 border-opacity-30'
                                            : 'bg-[#0f172a] text-white/60 border border-white/5 hover:bg-white/5 hover:text-white'
                                            }`}
                                        style={preferences.clutchTone === tone.file ? {
                                            backgroundColor: `${theme.primary}1a`,
                                            color: theme.primary,
                                            borderColor: `${theme.primary}4d`
                                        } : {}}
                                    >
                                        {tone.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }



    const handleSaveTelegram = async () => {
        setLoadingTelegram(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('You must be logged in');
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    telegram_chat_id: telegramChatId,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Telegram connected successfully!');
        } catch (error) {
            console.error('Failed to save Telegram ID:', error);
            toast.error(`Failed: ${error.message || 'Unknown error'}`);
        } finally {
            setLoadingTelegram(false);
        }
    };

    // Main Settings View
    return (
        <div className="flex flex-col h-full bg-[#0f172a] animate-slide-in text-white font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-[#0f172a] z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-white">Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* Main Menu Items */}
                <div className="space-y-4">

                    {/* Telegram Integration */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">INTEGRATIONS</h3>
                        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/5 p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                </div>
                                <div>
                                    <p className="font-medium text-white">Telegram Reminders</p>
                                    <p className="text-xs text-white/40">Get notified on your phone</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                                            <span className="text-xs font-bold">1</span>
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Start the bot: <a href="https://t.me/Mysuperschedule_bot" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">@Mysuperschedule_bot</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                                            <span className="text-xs font-bold">2</span>
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Get your ID from: <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">@userinfobot</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                                            <span className="text-xs font-bold">3</span>
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Paste your ID below and save.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value)}
                                        placeholder="Paste your Telegram ID here"
                                        className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 placeholder-white/20 font-medium"
                                    />
                                    <button
                                        onClick={handleSaveTelegram}
                                        disabled={loadingTelegram}
                                        className="bg-accent text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-lg shadow-accent/10"
                                    >
                                        {loadingTelegram ? 'Saving...' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Link */}
                    <button
                        onClick={() => setActiveSection('notifications')}
                        className="w-full bg-[#1e293b] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[#1e293b]/80 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent"
                                style={{ backgroundColor: `${theme.primary}33`, color: theme.primary }}>
                                <Bell size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">Notifications & Sounds</p>
                                <p className="text-xs text-white/40">Push alerts, tones, and volume</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
                    </button>

                    {/* Appearance */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">APPEARANCE</h3>
                        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/5">
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onUpdateTheme({ mode: 'dark', primary: t.color })}
                                    className="w-full p-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: t.color }}
                                        >
                                        </div>
                                        <span className="font-medium text-white">{t.name}</span>
                                    </div>
                                    {theme?.primary === t.color && (
                                        <Check size={20} className="text-accent" style={{ color: theme.primary }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Data & Backup */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">DATA & BACKUP</h3>
                        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/5">
                            <button
                                onClick={onExport}
                                className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-info">
                                        <Download size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Export Data</p>
                                        <p className="text-xs text-white/40">Copy schedule to clipboard</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={onImport}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-purple-400">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Import Data</p>
                                        <p className="text-xs text-white/40">Paste schedule from clipboard</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* About */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">ABOUT</h3>
                        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-white/5 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-white">Version</span>
                                <span className="text-white/40">2.0.0 (Premium)</span>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="w-full py-3 bg-[#0f172a] hover:bg-[#0f172a]/80 border border-white/10 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Refresh App
                            </button>
                        </div>
                    </section>

                </div>
                <div className="h-8"></div>
            </div>
        </div>
    );
};

export default SettingsView;
