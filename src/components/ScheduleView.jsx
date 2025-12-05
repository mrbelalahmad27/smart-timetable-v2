import React, { useState, useEffect, useRef } from 'react';
import { Menu, Calendar as CalendarIcon, Plus, Settings, User, X, ChevronLeft, ChevronRight, LayoutDashboard, BookOpen, Brain, Coffee, Clock, MapPin, Trash2, Building, GraduationCap } from 'lucide-react';
import { formatTime12Hour, getTimeRemaining } from '../utils/time';
import WeeklyView from './WeeklyView';
import AssignmentView from './AssignmentView';
import PomodoroView from './PomodoroView';
import { getRandomQuote, QUOTES } from '../utils/quotes';

const Sidebar = ({ isOpen, onClose, onSettingsClick, currentUser, onLogout }) => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const quotesList = QUOTES.general;

    // Swipe Logic
    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const minSwipeDistance = 50;

    const handleNextQuote = () => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotesList.length);
    };

    const handlePrevQuote = () => {
        setCurrentQuoteIndex((prev) => (prev - 1 + quotesList.length) % quotesList.length);
    };

    // Auto-rotate quotes
    useEffect(() => {
        const interval = setInterval(handleNextQuote, 5000);
        return () => clearInterval(interval);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNextQuote();
            if (e.key === 'ArrowLeft') handlePrevQuote();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) handleNextQuote();
        if (isRightSwipe) handlePrevQuote();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity cursor-pointer animate-fade-in"
                    onClick={onClose}
                />
            )}
            <div className={`absolute top-0 left-0 h-full w-80 bg-[#0f172a] border-r border-white/10 z-[100] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>

                {/* Premium Header */}
                <div className="p-6 bg-gradient-to-br from-accent/20 to-transparent border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-black font-bold shadow-lg shadow-accent/20 ring-2 ring-white/10">
                                {currentUser?.email ? currentUser.email[0].toUpperCase() : <User size={24} />}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg truncate max-w-[140px]">{currentUser?.email?.split('@')[0] || 'User'}</h3>
                                <div className="flex items-center gap-1.5 bg-accent/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                                    <p className="text-accent text-[10px] uppercase tracking-widest font-bold">Premium</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white active:scale-95">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => { onClose(); onSettingsClick(); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-accent/30 transition-all group active:scale-[0.98]"
                        >
                            <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-black transition-colors shadow-sm">
                                <Settings size={20} />
                            </div>
                            <span className="font-bold text-white">Settings</span>
                        </button>

                        <button
                            onClick={() => { onClose(); onLogout(); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-error/10 hover:border-error/30 transition-all group active:scale-[0.98]"
                        >
                            <div className="p-2 rounded-lg bg-error/10 text-error group-hover:bg-error group-hover:text-white transition-colors shadow-sm">
                                <User size={20} />
                            </div>
                            <span className="font-bold text-white">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Quote Card */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                    <div
                        className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 relative overflow-hidden group touch-pan-y shadow-xl hover:shadow-2xl transition-shadow"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain size={64} className="text-accent" />
                        </div>

                        <div className="flex justify-center mb-6 relative z-10">
                            <div className="p-3 rounded-full bg-accent/10 text-accent">
                                <Brain size={24} />
                            </div>
                        </div>

                        <div className="min-h-[100px] flex items-center justify-center text-center relative z-10">
                            <p className="text-base font-medium text-white/90 leading-relaxed transition-all duration-300 italic">
                                "{quotesList[currentQuoteIndex]}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-6 px-2 relative z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevQuote(); }}
                                className="p-2 text-white/20 hover:text-accent transition-colors active:scale-90"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1.5 justify-center">
                                {quotesList.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentQuoteIndex ? 'w-6 bg-accent' : 'w-1.5 bg-white/10'}`} />
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextQuote(); }}
                                className="p-2 text-white/20 hover:text-accent transition-colors active:scale-90"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="p-8 text-center relative">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h2 className="text-2xl font-black tracking-[0.2em] text-accent mb-2 mt-4 drop-shadow-sm">ALYNTO</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">PREMIUM SCHEDULER</p>
                    <p className="text-[10px] text-white/30 mt-6 tracking-wider font-medium">© 2025 ALYNTO INC.</p>
                </div>
            </div>
        </>
    );
};


const ScheduleView = ({ events = [], tasks = [], habits = [], preferences, onUpdateTask, currentDate, onDateChange, currentUser, onLogout, viewMode, onViewModeChange, onDeleteEvent, onAddClick, onSettingsClick, onPomodoroClick, onEventClick, activeTab = 'schedule', onTabChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const dateInputRef = useRef(null);
    const [, setTick] = useState(0); // Force re-render

    // Update UI every minute to keep "In Progress" / "Time Remaining" accurate
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Ensure activeTab is valid
    const validTabs = ['schedule', 'assignments', 'timer'];
    const currentTab = validTabs.includes(activeTab) ? activeTab : 'schedule';

    // Swipe Logic
    const touchStart = useRef(null);
    const touchStartY = useRef(null);
    const touchEnd = useRef(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (!touchStart.current || !touchEnd.current) return;

        const distanceX = touchStart.current - touchEnd.current;
        const distanceY = touchStartY.current - e.changedTouches[0].clientY;

        // Ignore if vertical scroll is dominant
        if (Math.abs(distanceY) > Math.abs(distanceX)) return;

        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        if (isLeftSwipe) {
            handleDateChange(1);
        } else if (isRightSwipe) {
            handleDateChange(-1);
        }
    };

    // Mouse Swipe Logic
    const isDragging = useRef(false);





    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            touchEnd.current = e.clientX;
        };

        const handleMouseUp = (e) => {
            if (!isDragging.current) return;
            isDragging.current = false;

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            if (!touchStart.current || !touchEnd.current) return;

            const distanceX = touchStart.current - touchEnd.current;
            const distanceY = touchStartY.current - e.clientY;

            if (Math.abs(distanceY) > Math.abs(distanceX)) return;

            const isLeftSwipe = distanceX > minSwipeDistance;
            const isRightSwipe = distanceX < -minSwipeDistance;

            if (isLeftSwipe) {
                handleDateChange(1);
            } else if (isRightSwipe) {
                handleDateChange(-1);
            }
        };

        const onMouseDown = (e) => {
            // Check if target is inside our container
            if (containerRef.current && containerRef.current.contains(e.target)) {
                // Ignore if target is draggable or inside a draggable element (for WeeklyView DnD)
                if (e.target.closest('[draggable="true"]')) return;

                isDragging.current = true;
                touchEnd.current = null;
                touchStart.current = e.clientX;
                touchStartY.current = e.clientY;

                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            }
        };

        // Use capture phase to ensure we get the event
        window.addEventListener('mousedown', onMouseDown, true);

        return () => {
            window.removeEventListener('mousedown', onMouseDown, true);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [currentDate]);



    const handleDeleteClick = (event) => {
        setEventToDelete(event);
    };

    const confirmDelete = () => {
        if (eventToDelete && onDeleteEvent) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
        }
    };

    const handleDateChange = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    const handleCalendarClick = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    const handleDateInputChange = (e) => {
        if (e.target.value) {
            const [year, month, day] = e.target.value.split('-').map(Number);
            const newDate = new Date(year, month - 1, day);
            onDateChange(newDate);
        }
    };

    // Filter events for the current date
    const filteredEvents = events.filter(event => {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        if (event.repeat === 'Weekly' && event.repeatDay === dayName) return true;
        if (event.repeat === 'Daily') return true;
        if (event.date) {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === currentDate.toDateString();
        }
        if (event.repeatDay === dayName) return true;
        return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="flex flex-col h-screen overflow-hidden relative bg-background text-white font-sans pb-0">
            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onSettingsClick={onSettingsClick}
                currentUser={currentUser}
                onLogout={onLogout}
            />

            <input
                type="date"
                ref={dateInputRef}
                className="absolute top-0 left-0 opacity-0 pointer-events-none"
                onChange={handleDateInputChange}
            />

            {/* Delete Modal */}
            {eventToDelete && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl scale-100 animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Event?</h3>
                        <p className="text-textMuted mb-6">Are you sure you want to delete "{eventToDelete.subject}"?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEventToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-error/20 text-error font-bold hover:bg-error/30 transition-colors active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div ref={containerRef} className="flex-1 flex flex-col relative overflow-hidden pb-0 touch-pan-y select-none"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

                {/* Schedule Tab */}
                <div style={{ display: currentTab === 'schedule' ? 'flex' : 'none', paddingTop: 'calc(3rem + env(safe-area-inset-top))' }} className="flex-1 flex flex-col overflow-y-auto no-scrollbar overscroll-y-none pb-32">
                    {/* Floating Header Pill (Attached to Top) */}
                    <div style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }} className="fixed top-0 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-1">
                        <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-2 pl-4 pr-2 shadow-xl flex items-center justify-between backdrop-blur-md bg-opacity-95">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMenuOpen(true)} className="text-white/70 hover:text-white transition-colors active:scale-95 p-1">
                                    <Menu size={28} />
                                </button>
                                <h1 className="text-xl font-bold tracking-tight text-white">Schedule</h1>
                            </div>

                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                <button
                                    onClick={() => onViewModeChange('daily')}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${viewMode === 'daily' ? 'bg-accent text-black shadow-sm' : 'text-textMuted hover:text-white'}`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => onViewModeChange('weekly')}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${viewMode === 'weekly' ? 'bg-accent text-black shadow-sm' : 'text-textMuted hover:text-white'}`}
                                >
                                    Week
                                </button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'weekly' ? (
                        <WeeklyView
                            events={events}
                            tasks={tasks}
                            habits={habits}
                            currentDate={currentDate}
                            onDateChange={onDateChange}
                            onEventClick={onEventClick}
                            onUpdateTask={onUpdateTask}
                        />
                    ) : (
                        <div className="px-6 pb-0 space-y-4">
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-2 px-2 mt-1">
                                <div>
                                    <h2 className="text-3xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                                        {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 bg-[#1E1E1E] rounded-xl p-1 border border-white/5 shadow-sm">
                                    <button onClick={() => handleDateChange(-1)} className="p-1.5 hover:text-accent transition-colors active:scale-90">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div
                                        onClick={handleCalendarClick}
                                        className="text-accent font-bold text-sm cursor-pointer min-w-[80px] text-center uppercase tracking-wider"
                                    >
                                        {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <button onClick={() => handleDateChange(1)} className="p-1.5 hover:text-accent transition-colors active:scale-90">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Stats/Summary Row */}
                            <div className="flex items-center justify-end gap-2 mb-6">
                                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#1E1E1E] border border-white/5 text-textMuted uppercase tracking-wider shadow-sm">
                                    {filteredEvents.length} Events
                                </span>
                                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#1E1E1E] border border-white/5 text-textMuted uppercase tracking-wider shadow-sm">
                                    {habits.length} Habits
                                </span>
                            </div>

                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => {
                                    const nextTime = getTimeRemaining(event, event.date || currentDate);
                                    return (
                                        <div
                                            key={event.id || index}
                                            onClick={() => onEventClick(event)}
                                            style={{ borderColor: event.color || 'rgba(255,255,255,0.1)' }}
                                            className="bg-[#1E1E1E] border-2 rounded-2xl p-5 relative group overflow-hidden hover:shadow-lg transition-all cursor-pointer shadow-md hover:-translate-y-1 active:scale-[0.99] duration-300"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-accent/10"></div>

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <h3 className="text-white font-bold text-xl leading-tight max-w-[70%]">{event.subject}</h3>
                                                {nextTime && (
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-sm ${nextTime === 'In Progress'
                                                        ? 'bg-accent text-black border-accent animate-glow-pulse'
                                                        : 'bg-accent/10 text-accent border-accent/20'
                                                        }`}>
                                                        {nextTime}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-3 mb-4 relative z-10">
                                                <div className="flex items-center gap-3 text-textMuted text-sm">
                                                    <div className="p-1.5 rounded-lg bg-white/5 text-accent">
                                                        <Clock size={14} />
                                                    </div>
                                                    <span className="font-medium text-white/90">{formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}</span>
                                                </div>
                                                {event.room && (
                                                    <div className="flex items-center gap-3 text-textMuted text-sm">
                                                        <div className="p-1.5 rounded-lg bg-white/5 text-accent">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <span>{event.building ? `${event.building} • ` : ''}{event.room}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-4 relative z-10">
                                                {event.type && (
                                                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 uppercase tracking-wider">
                                                        {event.type}
                                                    </span>
                                                )}
                                                {event.teacher && (
                                                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-textMuted border border-white/5 uppercase tracking-wider">
                                                        {event.teacher}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(event); }}
                                                className="absolute bottom-4 right-4 p-2 text-white/10 hover:text-error transition-colors opacity-0 group-hover:opacity-100 active:scale-90 z-20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 min-h-[50vh]">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                        <Coffee size={40} className="text-accent" />
                                    </div>
                                    <p className="text-white font-bold text-xl mb-2">No events today</p>
                                    <p className="text-sm text-textMuted max-w-[200px]">You're all caught up! Enjoy your free time or add a new task.</p>
                                </div>
                            )}

                            {habits.map((habit, index) => (
                                <div
                                    key={habit.id || `habit-${index}`}
                                    onClick={() => onEventClick(habit)}
                                    style={{ borderColor: habit.color ? `${habit.color}50` : 'rgba(168, 85, 247, 0.5)' }}
                                    className="bg-[#1E1E1E] border rounded-2xl p-5 relative group overflow-hidden transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99] duration-300 opacity-90"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: habit.color || '#a855f7' }}></div>
                                    <div className="flex justify-between items-start pl-2">
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{habit.subject}</h3>
                                            <div className="flex items-center text-textMuted text-sm mt-2 gap-3">
                                                <span className="flex items-center gap-2" style={{ color: habit.color || '#c084fc' }}>
                                                    <Clock size={14} /> {habit.duration}m
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border"
                                            style={{
                                                backgroundColor: habit.color ? `${habit.color}15` : 'rgba(168, 85, 247, 0.1)',
                                                color: habit.color || '#c084fc',
                                                borderColor: habit.color ? `${habit.color}30` : 'rgba(168, 85, 247, 0.2)'
                                            }}
                                        >
                                            Habit
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assignments Tab */}
                <div style={{ display: currentTab === 'assignments' ? 'block' : 'none' }} className="h-full overflow-hidden">
                    <AssignmentView
                        tasks={tasks}
                        onUpdateTask={onUpdateTask}
                        onAddClick={onAddClick}
                        onEditTask={onEventClick}
                        onBack={() => onTabChange('schedule')}
                    />
                </div>

                {/* Pomodoro Tab */}
                <div style={{ display: currentTab === 'timer' ? 'block' : 'none' }} className="h-full overflow-hidden">
                    <PomodoroView tasks={tasks} preferences={preferences} onBack={() => onTabChange('schedule')} />
                </div>
            </div>

            {/* Floating Bottom Navigation (The "Pill") */}
            <div style={{ bottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }} className="absolute left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
                <div className="bg-[#1E1E1E]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl shadow-black/50 flex items-center justify-between px-6 ring-1 ring-white/5">
                    <button
                        onClick={() => onTabChange('schedule')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentTab === 'schedule' ? 'text-accent scale-110' : 'text-white/40 hover:text-white active:scale-95'}`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${currentTab === 'schedule' ? 'bg-accent/10' : 'bg-transparent'}`}>
                            <LayoutDashboard size={20} strokeWidth={currentTab === 'schedule' ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-bold">Schedule</span>
                    </button>

                    <button
                        onClick={() => onTabChange('assignments')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentTab === 'assignments' ? 'text-accent scale-110' : 'text-white/40 hover:text-white active:scale-95'}`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${currentTab === 'assignments' ? 'bg-accent/10' : 'bg-transparent'}`}>
                            <BookOpen size={20} strokeWidth={currentTab === 'assignments' ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-bold">Assignment</span>
                    </button>

                    <button
                        onClick={() => onTabChange('timer')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentTab === 'timer' ? 'text-accent scale-110' : 'text-white/40 hover:text-white active:scale-95'}`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${currentTab === 'timer' ? 'bg-accent/10' : 'bg-transparent'}`}>
                            <Brain size={20} strokeWidth={currentTab === 'timer' ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-bold">Clutch</span>
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    <button
                        onClick={() => onAddClick(currentTab === 'assignments' ? { category: 'task' } : { category: 'event' })}
                        className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95 hover:shadow-accent/40"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;
