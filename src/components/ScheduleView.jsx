import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Check, Plus, Settings, User, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onSettingsClick, currentUser, onLogout }) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`absolute top-0 left-0 h-full w-64 bg-card z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                        <button onClick={onClose} className="text-textMuted hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-6 px-2">
                        <p className="text-textMuted text-sm">Signed in as</p>
                        <p className="text-white font-bold text-lg truncate">{currentUser}</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        <button
                            onClick={() => {
                                onClose();
                                onSettingsClick();
                            }}
                            className="flex items-center text-white space-x-4 w-full hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                            <Settings size={20} />
                            <span>Settings</span>
                        </button>

                        <button
                            onClick={() => {
                                onClose();
                                onLogout();
                            }}
                            className="flex items-center text-[#ef5350] space-x-4 w-full hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                            <User size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                        <p className="text-accent text-lg" style={{ fontFamily: '"Brush Script MT", "Comic Sans MS", cursive' }}>
                            Mysterious person
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

const ScheduleView = ({ events, onAddClick, onSettingsClick, onEventClick, onDeleteEvent, currentDate, onDateChange, currentUser, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    const [eventToDelete, setEventToDelete] = useState(null); // For confirmation modal

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const currentDayName = days[currentDate.getDay()];
    const currentDateNum = currentDate.getDate();
    const currentMonthName = months[currentDate.getMonth()];

    // Rolling 7-day navigation logic
    const handlePrevDay = () => {
        setDirection(-1);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const prevDate = new Date(currentDate);
        prevDate.setDate(currentDate.getDate() - 1);
        prevDate.setHours(0, 0, 0, 0);

        // If prev date is before today, loop to today + 6
        if (prevDate < today) {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 6);
            onDateChange(nextWeek);
        } else {
            onDateChange(prevDate);
        }
    };

    const handleNextDay = () => {
        setDirection(1);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 6);

        // If next date is beyond today + 6, loop back to today
        if (nextDate > maxDate) {
            onDateChange(today);
        } else {
            onDateChange(nextDate);
        }
    };

    // Helper to format time in 12-hour format
    const formatTime12Hour = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Helper to calculate time remaining
    const getTimeRemaining = (event, eventDate) => {
        if (!event.startTime) return null;

        const now = new Date();
        const [hours, minutes] = event.startTime.split(':').map(Number);
        const start = new Date(eventDate);
        start.setHours(hours, minutes, 0, 0);

        const diff = start - now;

        if (diff < 0) {
            // Check if it's currently happening (assuming 45 min duration if no end time, or use end time)
            const [endHours, endMinutes] = event.endTime ? event.endTime.split(':').map(Number) : [hours + 1, minutes];
            const end = new Date(eventDate);
            end.setHours(endHours, endMinutes, 0, 0);

            if (now < end) return "In Progress";

            // Calculate next occurrence for repeating events
            if (event.repeat === 'Daily') {
                const nextStart = new Date(start);
                nextStart.setDate(start.getDate() + 1);
                const nextDiff = nextStart - now;

                if (nextDiff > 0) {
                    const days = Math.floor(nextDiff / (1000 * 60 * 60 * 24));
                    const hrs = Math.floor((nextDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    return `Next: ${days > 0 ? `${days}d ` : ''}${hrs}h`;
                }
            } else if (event.repeat === 'Weekly') {
                const nextStart = new Date(start);
                nextStart.setDate(start.getDate() + 7);
                const nextDiff = nextStart - now;

                if (nextDiff > 0) {
                    const days = Math.floor(nextDiff / (1000 * 60 * 60 * 24));
                    const hrs = Math.floor((nextDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    return `Next: ${days}d ${hrs}h`;
                }
            }

            return "Finished";
        }

        const diffHrs = Math.floor(diff / (1000 * 60 * 60));
        const diffMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs > 24) return `Starts in ${Math.floor(diffHrs / 24)} days`;
        if (diffHrs > 0) return `Starts in ${diffHrs}h ${diffMins}m`;
        return `Starts in ${diffMins}m`;
    };

    // Force update every minute to refresh countdowns
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    // Filter events for the current day
    const filteredEvents = events.filter(event => {
        if (event.repeat === 'Daily') return true;
        if (event.repeat === 'Weekly' && event.repeatDay === currentDayName) return true;
        // For 'Never' or others, we default to showing if repeatDay matches (assuming weekly schedule logic)
        if (event.repeatDay === currentDayName) return true;
        return false;
    }).sort((a, b) => {
        // Sort by start time
        return a.startTime.localeCompare(b.startTime);
    });

    // Long press logic
    const [longPressTimer, setLongPressTimer] = useState(null);

    const handleTouchStart = (event) => {
        const timer = setTimeout(() => {
            setEventToDelete(event);
        }, 800); // 800ms for long press
        setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onSettingsClick={onSettingsClick}
                currentUser={currentUser}
                onLogout={onLogout}
            />

            {/* Delete Confirmation Modal */}
            {eventToDelete && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl transform scale-100 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Event?</h3>
                        <p className="text-textMuted mb-6">
                            Are you sure you want to delete <span className="text-white font-medium">"{eventToDelete.subject}"</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEventToDelete(null)}
                                className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteEvent(eventToDelete);
                                    setEventToDelete(null);
                                }}
                                className="flex-1 py-3 bg-[#ef5350] text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center p-4 pt-6">
                <button
                    className="text-white mr-4 hover:bg-white/10 p-1 rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(true)}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Schedule</h1>
            </header>

            {/* Date Row with Navigation */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/5">
                <button onClick={handlePrevDay} className="text-textMuted hover:text-white p-1">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{currentDayName}</div>
                    <div className="text-sm text-accent font-medium">{currentDateNum} {currentMonthName}</div>
                </div>
                <button onClick={handleNextDay} className="text-textMuted hover:text-white p-1">
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Main Content with Animation */}
            <main className="flex-1 overflow-y-auto p-4 relative overflow-x-hidden">
                <div
                    key={currentDate.toISOString()}
                    className={`min-h-full animate-slide-${direction === 0 ? 'in' : direction > 0 ? 'left' : 'right'}`}
                >
                    {filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center pt-20">
                            <Calendar size={80} className="text-cardLight mb-4" strokeWidth={1} />
                            <h2 className="text-white text-xl font-medium mb-1">No events</h2>
                            <p className="text-textMuted text-sm">Tap '+' to add a new event</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEvents.map((event, index) => {
                                const status = getTimeRemaining(event, currentDate);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => onEventClick && onEventClick(event)}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            setEventToDelete(event);
                                        }}
                                        onTouchStart={() => handleTouchStart(event)}
                                        onTouchEnd={handleTouchEnd}
                                        onMouseDown={() => handleTouchStart(event)} // Also support long click on desktop
                                        onMouseUp={handleTouchEnd}
                                        onMouseLeave={handleTouchEnd}
                                        className="bg-card p-4 rounded-lg border-l-4 shadow-md cursor-pointer hover:bg-cardLight transition-colors select-none"
                                        style={{ borderLeftColor: event.color || '#4db6ac' }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-white font-bold text-lg">{event.subject}</h3>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium bg-black/20 px-2 py-1 rounded mb-1" style={{ color: event.color || '#4db6ac' }}>
                                                    {formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}
                                                </span>
                                                {status && (
                                                    <span className={`text-xs font-bold ${status === 'In Progress' ? 'text-green-400 animate-pulse' :
                                                        status === 'Finished' ? 'text-textMuted' : 'text-accent'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-sm text-textMuted">
                                            <span>{event.building} {event.room && `- ${event.room}`}</span>
                                            <span style={{ color: event.color || '#4db6ac' }}>{event.type}</span>
                                        </div>
                                        {event.teacher && (
                                            <div className="mt-1 text-sm text-textMuted">
                                                {event.teacher}
                                            </div>
                                        )}
                                        {event.reminders && event.reminders.length > 0 && (
                                            <div className="mt-2 flex gap-2">
                                                {event.reminders.map((rem, i) => (
                                                    <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-textMuted">
                                                        {rem.label || rem}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div >
                    )}
                </div >
            </main >



            {/* Floating Action Button */}
            < button
                onClick={onAddClick}
                className="absolute bottom-6 right-6 w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-all z-20"
            >
                <Plus size={32} className="text-white" />
            </button >
        </div >
    );
};

export default ScheduleView;
