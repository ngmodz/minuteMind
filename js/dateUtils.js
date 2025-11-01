// Date utility functions with timezone handling
export class DateUtils {
    static getUserTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static formatDateForStorage(date) {
        // Always store dates in UTC for consistency
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    static formatDateForDisplay(dateString, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: this.getUserTimezone()
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        const date = new Date(dateString + 'T00:00:00'); // Treat as local date
        
        return date.toLocaleDateString('en-US', formatOptions);
    }

    static getCurrentDateString() {
        // Get current date in user's timezone
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    static addDays(dateString, days) {
        const date = new Date(dateString + 'T00:00:00');
        date.setDate(date.getDate() + days);
        return this.formatDateForStorage(date);
    }

    static diffInDays(date1String, date2String) {
        const date1 = new Date(date1String + 'T00:00:00');
        const date2 = new Date(date2String + 'T00:00:00');
        const diffTime = Math.abs(date2 - date1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    static isSameDay(date1String, date2String) {
        return date1String === date2String;
    }

    static isToday(dateString) {
        return this.isSameDay(dateString, this.getCurrentDateString());
    }

    static getWeekStart(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const dayOfWeek = date.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Handle Sunday as 0
        
        const monday = new Date(date);
        monday.setDate(date.getDate() - daysToMonday);
        
        return this.formatDateForStorage(monday);
    }

    static getMonthRange(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        return {
            start: this.formatDateForStorage(firstDay),
            end: this.formatDateForStorage(lastDay)
        };
    }

    static formatTimeForDisplay(hours, minutes) {
        if (hours === 0 && minutes === 0) {
            return '0 minutes';
        }
        
        const parts = [];
        if (hours > 0) {
            parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        }
        
        return parts.join(' ');
    }

    static convertMinutesToHoursAndMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    }

    static convertHoursAndMinutesToMinutes(hours, minutes) {
        return (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    }
}