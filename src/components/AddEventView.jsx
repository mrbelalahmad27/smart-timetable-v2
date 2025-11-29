import React, { useState, useRef } from 'react';
import { X, ChevronRight, Bell, Trash2, Link as LinkIcon, Plus, PenTool, Type, Eraser, Undo, Redo } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const COLORS = [
    '#ef5350', // Red
    '#ec407a', // Pink
    '#ab47bc', // Purple
    '#7e57c2', // Deep Purple
    '#5c6bc0', // Indigo
    '#42a5f5', // Blue
    '#29b6f6', // Light Blue
    '#26c6da', // Cyan
    '#26a69a', // Teal (Default)
    '#66bb6a', // Green
    '#9ccc65', // Light Green
    '#d4e157', // Lime
    '#ffee58', // Yellow
    '#ffca28', // Amber
    '#ffa726', // Orange
    '#ff7043'  // Deep Orange
];

const REPEAT_OPTIONS = ['Never', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddEventView = ({ onClose, onAdd, onDelete, initialData, initialTab = 'details' }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // 'details' | 'links' | 'notes'
    const [noteMode, setNoteMode] = useState('text'); // 'text' | 'draw'
    const canvasRef = useRef(null);

    const [formData, setFormData] = useState(initialData || {
        subject: '',
        type: '',
        building: '',
        room: '',
        teacher: '',
        repeat: 'Weekly',
        repeatDay: 'Friday',
        startTime: '08:30',
        endTime: '09:15',
        color: '#4db6ac',
        reminders: [],
        links: [],
        notes: { text: '', drawing: null }
    });

    // Ensure notes object exists if opening old event
    if (!formData.notes) {
        formData.notes = { text: '', drawing: null };
    }

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showRepeatOptions, setShowRepeatOptions] = useState(false);

    // Input states
    const [showReminderInput, setShowReminderInput] = useState(false);
    const [newReminderText, setNewReminderText] = useState('');

    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newLinkText, setNewLinkText] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNoteChange = (content) => {
        setFormData(prev => ({
            ...prev,
            notes: { ...prev.notes, text: content }
        }));
    };

    const handleDrawingChange = async () => {
        if (canvasRef.current) {
            const path = await canvasRef.current.exportPaths();
            setFormData(prev => ({
                ...prev,
                notes: { ...prev.notes, drawing: path }
            }));
        }
    };

    const handleSubmit = () => {
        if (!formData.subject) return;
        onAdd(formData);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${formData.subject}"?`)) {
            onDelete(initialData);
            onClose();
        }
    };

    const handleAddReminder = () => {
        if (newReminderText.trim()) {
            const mins = parseInt(newReminderText);
            if (!isNaN(mins) && mins > 0) {
                setFormData(prev => ({
                    ...prev,
                    reminders: [...prev.reminders, { value: mins, label: `${mins} mins before` }]
                }));
                setNewReminderText('');
                setShowReminderInput(false);
            }
        }
    };

    const removeReminder = (index) => {
        setFormData(prev => ({
            ...prev,
            reminders: prev.reminders.filter((_, i) => i !== index)
        }));
    };

    const handleAddLink = () => {
        if (newLinkText.trim()) {
            setFormData(prev => ({
                ...prev,
                links: [...prev.links, newLinkText]
            }));
            setNewLinkText('');
            setShowLinkInput(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background animate-slide-in relative">
            {/* Header */}
            <header className="flex items-center justify-between p-4 pt-6 border-b border-white/5">
                <button onClick={onClose} className="text-textMuted hover:text-white" type="button">
                    <X size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">{initialData ? 'Edit Event' : 'Event'}</h1>
                <div className="flex items-center gap-3">
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            className="text-[#ef5350] hover:bg-white/10 p-2 rounded-full transition-colors"
                            type="button"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.subject}
                        type="button"
                        className={`px-6 py-1.5 rounded-full font-bold text-sm transition-colors ${formData.subject
                            ? 'bg-accent text-black hover:bg-opacity-90'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                        style={{ backgroundColor: formData.subject ? formData.color : undefined }}
                    >
                        {initialData ? 'SAVE' : 'ADD'}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
                {/* Main Inputs */}
                <div className="flex flex-col">
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-transparent border-b border-white/10 py-3 text-2xl font-bold text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                        style={{ borderColor: formData.subject ? formData.color : undefined }}
                        autoFocus
                    />
                    {activeTab === 'details' && (
                        <>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-textMuted text-xs ml-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-textMuted text-xs ml-1">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                name="type"
                                placeholder="Event type"
                                value={formData.type}
                                onChange={handleChange}
                                className="bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                            />
                            <input
                                type="text"
                                name="building"
                                placeholder="Building"
                                value={formData.building}
                                onChange={handleChange}
                                className="bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                            />
                            <input
                                type="text"
                                name="room"
                                placeholder="Room"
                                value={formData.room}
                                onChange={handleChange}
                                className="bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                            />
                            <input
                                type="text"
                                name="teacher"
                                placeholder="Teacher"
                                value={formData.teacher}
                                onChange={handleChange}
                                className="bg-transparent border-b border-white/10 py-3 text-white placeholder-textMuted focus:outline-none focus:border-accent transition-colors"
                            />
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`py-3 rounded font-medium transition-colors ${activeTab === 'details' ? 'bg-white/10 text-white' : 'bg-card text-textMuted hover:bg-cardLight'}`}
                    >
                        Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('links')}
                        className={`py-3 rounded font-medium transition-colors ${activeTab === 'links' ? 'bg-white/10 text-white' : 'bg-card text-textMuted hover:bg-cardLight'}`}
                    >
                        Links ({formData.links.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`py-3 rounded font-medium transition-colors ${activeTab === 'notes' ? 'bg-white/10 text-white' : 'bg-card text-textMuted hover:bg-cardLight'}`}
                    >
                        Notes
                    </button>
                </div>

                {activeTab === 'details' ? (
                    <>
                        {/* Repeat Section */}
                        <div className="bg-card rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">Repeat</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowRepeatOptions(!showRepeatOptions)}
                                    className="text-accent text-sm font-medium"
                                    style={{ color: formData.color }}
                                >
                                    {showRepeatOptions ? 'Done' : 'Edit'}
                                </button>
                            </div>

                            {showRepeatOptions ? (
                                <div className="space-y-4 animate-slide-in">
                                    <div className="space-y-2">
                                        <label className="text-textMuted text-sm">Frequency</label>
                                        <div className="flex flex-wrap gap-2">
                                            {REPEAT_OPTIONS.map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, repeat: option }))}
                                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.repeat === option
                                                        ? 'bg-accent text-black border-accent'
                                                        : 'border-white/20 text-textMuted hover:border-white/40'
                                                        }`}
                                                    style={{
                                                        backgroundColor: formData.repeat === option ? formData.color : undefined,
                                                        borderColor: formData.repeat === option ? formData.color : undefined
                                                    }}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-textMuted text-sm">Day</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS.map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, repeatDay: day }))}
                                                    className={`w-8 h-8 rounded-full text-xs flex items-center justify-center border transition-colors ${formData.repeatDay === day
                                                        ? 'bg-accent text-black border-accent'
                                                        : 'border-white/20 text-textMuted hover:border-white/40'
                                                        }`}
                                                    style={{
                                                        backgroundColor: formData.repeatDay === day ? formData.color : undefined,
                                                        borderColor: formData.repeatDay === day ? formData.color : undefined
                                                    }}
                                                >
                                                    {day.slice(0, 1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="text-textMuted">Frequency</span>
                                        <span className="text-accent font-medium" style={{ color: formData.color }}>{formData.repeat}</span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="text-textMuted">Day</span>
                                        <span className="text-accent font-medium" style={{ color: formData.color }}>{formData.repeatDay}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Reminders Section */}
                        {formData.reminders.length > 0 && (
                            <div className="bg-card rounded-xl p-4 space-y-2">
                                <h3 className="text-white font-bold text-lg mb-2">Reminders</h3>
                                {formData.reminders.map((reminder, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                        <div className="flex items-center text-white">
                                            <Bell size={16} className="mr-3 text-textMuted" />
                                            {reminder.label || reminder}
                                        </div>
                                        <button onClick={() => removeReminder(index)} className="text-textMuted hover:text-[#ef5350]" type="button">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="space-y-4 pt-2">
                            {showReminderInput ? (
                                <div className="flex gap-2 animate-slide-in">
                                    <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                        <input
                                            type="number"
                                            value={newReminderText}
                                            onChange={(e) => setNewReminderText(e.target.value)}
                                            placeholder="15"
                                            className="w-full bg-transparent text-white focus:outline-none"
                                            autoFocus
                                            min="1"
                                        />
                                        <span className="text-textMuted text-sm ml-2 whitespace-nowrap">mins before</span>
                                    </div>
                                    <button
                                        onClick={handleAddReminder}
                                        className="bg-accent text-black font-bold px-4 rounded-lg"
                                        style={{ backgroundColor: formData.color }}
                                        type="button"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowReminderInput(false)}
                                        className="bg-white/10 text-white px-4 rounded-lg"
                                        type="button"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowReminderInput(true)}
                                    className="w-full py-3 text-accent font-medium border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                    style={{ color: formData.color }}
                                    type="button"
                                >
                                    + Set Reminder
                                </button>
                            )}
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="w-full py-4 text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center relative"
                                style={{ backgroundColor: formData.color }}
                                type="button"
                            >
                                Color
                                {showColorPicker && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-card p-4 rounded-xl shadow-xl z-10 grid grid-cols-4 gap-3 border border-white/10">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(prev => ({ ...prev, color: c }));
                                                    setShowColorPicker(false);
                                                }}
                                                className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c, borderColor: formData.color === c ? 'white' : 'transparent' }}
                                                type="button"
                                            />
                                        ))}
                                    </div>
                                )}
                            </button>


                        </div>
                    </>
                ) : activeTab === 'links' ? (
                    <div className="space-y-4">
                        {showLinkInput ? (
                            <div className="flex gap-2 animate-slide-in">
                                <input
                                    type="text"
                                    value={newLinkText}
                                    onChange={(e) => setNewLinkText(e.target.value)}
                                    placeholder="https://example.com"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddLink}
                                    className="bg-accent text-black font-bold px-4 rounded-lg"
                                    style={{ backgroundColor: formData.color }}
                                    type="button"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setShowLinkInput(false)}
                                    className="bg-white/10 text-white px-4 rounded-lg"
                                    type="button"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLinkInput(true)}
                                className="w-full py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 flex items-center justify-center space-x-2"
                                type="button"
                            >
                                <Plus size={20} />
                                <span>Add Link</span>
                            </button>
                        )}
                        {formData.links.map((link, i) => (
                            <div key={i} className="bg-card p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <LinkIcon size={16} className="text-textMuted flex-shrink-0" />
                                    <span className="text-white truncate">{link}</span>
                                </div>
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }))}
                                    className="text-textMuted hover:text-[#ef5350]"
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Notes Toolbar */}
                        <div className="flex items-center justify-center bg-white/5 p-2 rounded-lg mb-4 gap-2">
                            <button
                                onClick={() => setNoteMode('text')}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${noteMode === 'text' ? 'bg-accent text-black' : 'text-textMuted hover:text-white'}`}
                                style={{ backgroundColor: noteMode === 'text' ? formData.color : undefined }}
                                type="button"
                            >
                                <Type size={18} className="mr-2" />
                                Text
                            </button>
                            <button
                                onClick={() => setNoteMode('draw')}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${noteMode === 'draw' ? 'bg-accent text-black' : 'text-textMuted hover:text-white'}`}
                                style={{ backgroundColor: noteMode === 'draw' ? formData.color : undefined }}
                                type="button"
                            >
                                <PenTool size={18} className="mr-2" />
                                Draw
                            </button>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 bg-white rounded-lg overflow-hidden text-black min-h-[400px] relative">
                            {noteMode === 'text' ? (
                                <ReactQuill
                                    theme="snow"
                                    value={formData.notes.text}
                                    onChange={handleNoteChange}
                                    className="h-full"
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ['clean']
                                        ]
                                    }}
                                />
                            ) : (
                                <div className="h-full w-full relative">
                                    <ReactSketchCanvas
                                        ref={canvasRef}
                                        strokeWidth={4}
                                        strokeColor="black"
                                        canvasColor="transparent"
                                        className="h-full w-full"
                                        onChange={handleDrawingChange}
                                        defaultPaths={formData.notes.drawing || []}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => canvasRef.current?.undo()}
                                            className="p-2 bg-white shadow rounded-full hover:bg-gray-100"
                                            type="button"
                                        >
                                            <Undo size={16} />
                                        </button>
                                        <button
                                            onClick={() => canvasRef.current?.redo()}
                                            className="p-2 bg-white shadow rounded-full hover:bg-gray-100"
                                            type="button"
                                        >
                                            <Redo size={16} />
                                        </button>
                                        <button
                                            onClick={() => canvasRef.current?.clearCanvas()}
                                            className="p-2 bg-white shadow rounded-full hover:bg-gray-100 text-red-500"
                                            type="button"
                                        >
                                            <Eraser size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};

export default AddEventView;
