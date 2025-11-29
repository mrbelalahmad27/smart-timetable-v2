export const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getNextOccurrence = (event) => {
    if (!event.startTime) return null;

    const now = new Date();
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    // If event is today and hasn't passed (or is in progress), start is today.
    // But we need to check repeat logic.

    // Logic from ScheduleView was:
    // 1. Check if "now" is before "end" (In Progress)
    // 2. If passed, check repeat.

    // For notification scheduling, we only care about FUTURE start times.

    if (start > now) {
        // It's later today. Check if today matches repeat rule.
        const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
        if (event.repeat === 'Daily') return start;
        if (event.repeat === 'Weekly' && event.repeatDay === currentDayName) return start;
        if (event.repeatDay === currentDayName) return start; // Default/Never
    }

    // If passed or not today, find next.
    if (event.repeat === 'Daily') {
        const next = new Date(start);
        if (start <= now) {
            next.setDate(start.getDate() + 1);
        }
        return next;
    }

    if (event.repeat === 'Weekly') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const eventDayIndex = days.indexOf(event.repeatDay);
        const currentDayIndex = now.getDay();

        let daysUntil = eventDayIndex - currentDayIndex;
        if (daysUntil <= 0) {
            // If today is the day but time passed, or if day is previous
            // But wait, if today is the day and time passed, we want next week (7 days).
            // If today is the day and time NOT passed, we handled it above (start > now).
            daysUntil += 7;
        }

        const next = new Date(start);
        next.setDate(start.getDate() + daysUntil);
        return next;
    }

    return null; // No future occurrence
};

export const getTimeRemaining = (event, eventDate) => {
    if (!event.startTime) return null;

    const now = new Date();
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const start = new Date(eventDate);
    start.setHours(hours, minutes, 0, 0);

    const diff = start - now;

    if (diff < 0) {
        // Check if it's currently happening
        const [endHours, endMinutes] = event.endTime ? event.endTime.split(':').map(Number) : [hours + 1, minutes];
        const end = new Date(eventDate);
        end.setHours(endHours, endMinutes, 0, 0);

        if (now < end) return "In Progress";

        // Calculate next occurrence for repeating events
        const next = getNextOccurrence(event);
        if (next) {
            const nextDiff = next - now;
            if (nextDiff > 0) {
                const days = Math.floor(nextDiff / (1000 * 60 * 60 * 24));
                const hrs = Math.floor((nextDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                return `Next: ${days > 0 ? `${days}d ` : ''}${hrs}h`;
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
