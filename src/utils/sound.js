let audioCtx = null;

export const initAudio = () => {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

// Simple beep sound using Web Audio API
export const playNotificationSound = () => {
    try {
        if (!audioCtx) {
            initAudio();
        }

        if (!audioCtx) return;

        // Ensure context is running
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Drop to A4

        // Louder volume (0.5) and longer duration (3s)
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);

        osc.start();
        osc.stop(audioCtx.currentTime + 3.0);

    } catch (e) {
        console.error("Failed to play sound", e);
    }
};
