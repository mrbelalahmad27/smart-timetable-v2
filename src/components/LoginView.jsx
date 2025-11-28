import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

const LoginView = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) return;

        const cleanUsername = username.trim();
        const storedPassword = localStorage.getItem(`app-auth-${cleanUsername}`);

        if (isLoginMode) {
            // LOGIN MODE
            if (storedPassword) {
                if (storedPassword === password) {
                    onLogin(cleanUsername);
                } else {
                    setError('Incorrect password');
                }
            } else {
                setError('Account not found. Please create an account.');
            }
        } else {
            // SIGNUP MODE
            if (storedPassword) {
                setError('Username already taken. Please sign in.');
            } else if (password !== confirmPassword) {
                setError('Passwords do not match');
            } else {
                // Create account
                localStorage.setItem(`app-auth-${cleanUsername}`, password);
                onLogin(cleanUsername);
            }
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-2xl border border-white/5">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                        <User size={40} className="text-accent" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">
                    {isLoginMode ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-textMuted text-center mb-8">
                    {isLoginMode ? 'Sign in to access your schedule' : 'Sign up to get started'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textMuted ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textMuted ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                        </div>

                        {!isLoginMode && (
                            <div className="space-y-2 animate-slide-in">
                                <label className="text-sm font-medium text-textMuted ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Confirm password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-[#ef5350] text-sm text-center bg-[#ef5350]/10 py-2 rounded-lg animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!username.trim() || !password.trim() || (!isLoginMode && !confirmPassword.trim())}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${username.trim() && password.trim() && (isLoginMode || confirmPassword.trim())
                                ? 'bg-accent text-black hover:bg-opacity-90 shadow-lg hover:shadow-accent/20'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-accent text-sm hover:underline transition-all"
                    >
                        {isLoginMode ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-textMuted text-sm text-center max-w-xs">
                Your data is stored locally on this device.
            </p>
        </div>
    );
};

export default LoginView;
