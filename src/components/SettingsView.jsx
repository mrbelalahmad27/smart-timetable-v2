import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

const THEMES = [
    { name: 'Teal', primary: '#4db6ac', bg: '#121212', card: '#1e1e1e', cardLight: '#2c2c2c' },
    { name: 'Blue', primary: '#42a5f5', bg: '#0d1117', card: '#161b22', cardLight: '#21262d' },
    { name: 'Purple', primary: '#ab47bc', bg: '#130e1a', card: '#1f182b', cardLight: '#2d2438' },
    { name: 'Green', primary: '#66bb6a', bg: '#0e1510', card: '#162018', cardLight: '#1f2922' },
    { name: 'Orange', primary: '#ffa726', bg: '#1a1008', card: '#2b1b0e', cardLight: '#3d2918' },
];

const SettingsView = ({ currentTheme, onThemeChange, onClose }) => {
    return (
        <div className="flex flex-col h-full bg-background animate-slide-in">
            {/* Header */}
            <header className="flex items-center p-4 pt-6 border-b border-white/5">
                <button onClick={onClose} className="text-white mr-4 hover:bg-white/10 p-1 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Settings</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-8">
                {/* Theme Section */}
                <section>
                    <h2 className="text-textMuted text-sm font-bold uppercase tracking-wider mb-4">Appearance</h2>
                    <div className="bg-card rounded-xl overflow-hidden">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.name}
                                onClick={() => onThemeChange(theme)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-8 h-8 rounded-full border border-white/10"
                                        style={{ backgroundColor: theme.primary }}
                                    />
                                    <span className="text-white font-medium">{theme.name}</span>
                                </div>
                                {currentTheme.name === theme.name && (
                                    <Check size={20} className="text-accent" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* About Section (Placeholder) */}
                <section>
                    <h2 className="text-textMuted text-sm font-bold uppercase tracking-wider mb-4">About</h2>
                    <div className="bg-card rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-white">
                            <span>Version</span>
                            <span className="text-textMuted">1.0.0</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SettingsView;
