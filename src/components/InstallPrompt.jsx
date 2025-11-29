import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, so clear it
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-accent text-black p-4 rounded-xl shadow-2xl z-50 animate-slide-in flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-black/10 p-2 rounded-full">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Install App</h3>
                    <p className="text-xs opacity-80">Add to Home Screen for quick access</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="p-2 hover:bg-black/5 rounded-full"
                >
                    <X size={20} />
                </button>
                <button
                    onClick={handleInstallClick}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-80 transition-colors"
                >
                    Install
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
