// Main Application JavaScript
import { db } from './supabase.js';
import { StudyCharts } from './charts.js';
import { SUPABASE_CONFIG } from './config.js';

let studyCharts;

class MinuteMind {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.motivationalQuotes = [
            "The expert in anything was once a beginner.",
            "Success is the sum of small efforts repeated day in and day out.",
            "The only way to do great work is to love what you do.",
            "Learning never exhausts the mind.",
            "Education is the most powerful weapon which you can use to change the world.",
            "The beautiful thing about learning is that no one can take it away from you.",
            "Believe you can and you're halfway there.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It always seems impossible until it's done.",
            "The only impossible journey is the one you never begin.",
            "Knowledge is power. Information is liberating.",
            "Live as if you were to die tomorrow. Learn as if you were to live forever.",
            "An investment in knowledge pays the best interest.",
            "The more that you read, the more things you will know.",
            "Learning is a treasure that will follow its owner everywhere."
        ];
        
        this.init();
    }

    async init() {
        console.log('MinuteMind.init() called');
        
        // Initialize Supabase client for auth
        if (typeof window !== 'undefined' && window.supabase) {
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
        } else {
            console.error('Supabase library not found. Make sure the CDN script is loaded.');
            this.supabase = null;
        }

        // Check authentication first
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
            console.log('Authentication failed, stopping initialization');
            return;
        }
        
        this.setupEventListeners();
        this.updateDateTime();
        this.setTodayDate();
        this.showUserStatus();
        this.loadDashboard();
        this.showDailyQuote();
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            studyCharts = new StudyCharts();
            this.loadCharts();
        }, 100);
        
        // Update time every second
        setInterval(() => this.updateDateTime(), 1000);
        
        // Load theme preference
        this.loadTheme();
        
        // Load active tab preference
        this.loadActiveTab();
        
        console.log('MinuteMind initialization complete');
    }

    async checkAuthentication() {
        try {
            if (!this.supabase) {
                console.log('Supabase not available, redirecting to auth check');
                window.location.href = 'auth-check.html';
                return false;
            }
            
            // Check for existing session first (this includes stored sessions)
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError) {
                console.error('Session check error:', sessionError);
                window.location.href = 'auth-check.html';
                return false;
            }
            
            if (session && session.user) {
                console.log('User authenticated via session:', session.user.email);
                this.currentUser = session.user;
                return true;
            }
            
            // If no session, try to get current user (for immediate auth)
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error || !user) {
                console.log('No authenticated user found, redirecting to auth check');
                window.location.href = 'auth-check.html';
                return false;
            }
            
            console.log('User authenticated:', user.email);
            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = 'auth-check.html';
            return false;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Study form submission
        const studyForm = document.getElementById('studyForm');
        if (studyForm) {
            console.log('Attaching study form event listener');
            studyForm.addEventListener('submit', (e) => this.handleStudySubmit(e));
        } else {
            console.error('Study form not found');
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            console.log('Attaching dark mode toggle event listener');
            darkModeToggle.addEventListener('click', () => this.toggleTheme());
        } else {
            console.error('Dark mode toggle not found');
        }

        // Export data button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Sign out button
        const signOutBtn = document.getElementById('signOut');
        if (signOutBtn) {
            console.log('Sign out button found, adding event listener...');
            signOutBtn.addEventListener('click', () => {
                console.log('Sign out button clicked!');
                this.signOut();
            });
        } else {
            console.error('Sign out button not found!');
        }

        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Keyboard shortcuts for accessibility
        document.addEventListener('keydown', (e) => {
            // Future keyboard shortcuts can be added here
        });
    }

    // Update current time and date
    updateDateTime() {
        const now = new Date();
        
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Set today's date in the form
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        
        // Set date for main study form
        const dateInput = document.getElementById('studyDate');
        if (dateInput) {
            dateInput.value = today;
        }
        
        // Set date for edit form if it's empty
        const editDateInput = document.getElementById('editDate');
        if (editDateInput && !editDateInput.value) {
            editDateInput.value = today;
        }
    }

    // Show daily motivational quote
    showDailyQuote() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quoteIndex = dayOfYear % this.motivationalQuotes.length;
        
        const quoteElement = document.getElementById('dailyQuote');
        if (quoteElement) {
            quoteElement.textContent = this.motivationalQuotes[quoteIndex];
        }
    }

    // Show user status in header
    showUserStatus() {
        const statusElement = document.getElementById('userStatus');
        if (!statusElement || !this.currentUser) return;
        
        // Show just the username part before @ symbol for cleaner display
        const email = this.currentUser.email;
        const username = email.split('@')[0];
        
        statusElement.textContent = `👤 ${username}`;
        statusElement.className = 'user-status authenticated';
        statusElement.title = email; // Show full email on hover
    }

    // Handle study form submission
    async handleStudySubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const date = formData.get('date');
        const hours = parseInt(formData.get('hours')) || 0;
        const minutes = parseInt(formData.get('minutes')) || 0;

        if (hours === 0 && minutes === 0) {
            this.showMessage('Please enter a valid study time.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await db.createEntry(date, hours, minutes, this.currentUser?.id);
            
            if (error) {
                this.showMessage(`Error: ${error}`, 'error');
            } else {
                this.showMessage('Study time logged successfully!', 'success');
                // Reset form
                document.getElementById('hours').value = 0;
                document.getElementById('minutes').value = 0;
                
                // Refresh dashboard
                await this.loadDashboard();
                await this.loadCharts();
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async signOut() {
        console.log('signOut method called');
        try {
            if (!this.supabase) {
                console.log('Supabase not available, redirecting to auth check...');
                window.location.href = 'auth-check.html';
                return;
            }
            
            console.log('Attempting to sign out...');
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
                this.showMessage('Error signing out. Please try again.', 'error');
            } else {
                console.log('Sign out successful, redirecting...');
                // Clear any local storage data related to the user
                this.clearUserData();
                window.location.href = 'auth-check.html';
            }
        } catch (error) {
            console.error('Sign out failed:', error);
            this.showMessage('Error signing out. Please try again.', 'error');
        }
    }

    // Clear user-specific data from localStorage
    clearUserData() {
        // Clear any user-specific localStorage keys
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('minutemind_entries_') || 
                key.startsWith('minutemind_guest_') ||
                key === 'minutemind_auth_mode') {
                localStorage.removeItem(key);
            }
        });
    }

    // Load dashboard data
    async loadDashboard() {
        try {
            const { data: entries, error } = await db.getAllEntries();
            
            if (error) {
                console.error('Error loading entries:', error);
                return;
            }

            this.displayRecentEntries(entries);
            this.calculateInsights(entries);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    // Display recent entries
    displayRecentEntries(entries) {
        const container = document.getElementById('recentEntriesList');
        if (!container) return;

        const recent = entries.slice(0, 10);

        if (recent.length === 0) {
            container.innerHTML = '<p class="text-muted">No study entries yet. Log your first session!</p>';
            return;
        }

        container.innerHTML = recent.map(entry => `
            <div class="entry-item">
                <div class="entry-info">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-time">${new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="entry-duration">${this.formatDuration(entry.hours, entry.minutes)}</div>
            </div>
        `).join('');
    }

    // Calculate and display insights
    calculateInsights(entries) {
        if (entries.length === 0) {
            this.displayEmptyInsights();
            return;
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Filter entries for current month
        const monthEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        // Calculate metrics
        const totalMinutes = monthEntries.reduce((sum, entry) => sum + entry.total_minutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        const daysStudied = monthEntries.length;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const studyPercentage = Math.round((daysStudied / daysInMonth) * 100);

        // Daily average: total minutes divided by days studied (not days in month)
        const dailyAverage = daysStudied > 0 ? totalMinutes / daysStudied : 0;
        const dailyAvgHours = Math.floor(dailyAverage / 60);
        const dailyAvgMins = Math.round(dailyAverage % 60);

        // Weekly average: total minutes divided by actual weeks passed in month
        const today = new Date();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const daysPassed = Math.max(1, Math.ceil((today - firstDayOfMonth) / (1000 * 60 * 60 * 24)) + 1);
        const weeksPassed = Math.max(1, daysPassed / 7);
        const weeklyAverageMinutes = totalMinutes / weeksPassed;
        const weeklyAvgHours = Math.floor(weeklyAverageMinutes / 60);
        const weeklyAvgMins = Math.round(weeklyAverageMinutes % 60);

        // Calculate streaks (use monthly entries for current streak)
        const { longestStreak, currentStreak } = this.calculateStreaks(monthEntries);

        // Update DOM
        this.updateElement('totalStudyTime', `${totalHours}h ${remainingMinutes}m`);
        this.updateElement('dailyAverage', `${dailyAvgHours}h ${dailyAvgMins}m`);
        this.updateElement('weeklyAverage', `${weeklyAvgHours}h ${weeklyAvgMins}m`);
        this.updateElement('longestStreak', `${longestStreak} days`);
        this.updateElement('currentStreak', `${currentStreak} days`);
        this.updateElement('studyPercentage', `${studyPercentage}%`);
    }

    // Calculate study streaks
    calculateStreaks(monthEntries) {
        if (monthEntries.length === 0) return { longestStreak: 0, currentStreak: 0 };

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Get first day of current month
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        
        const sortedEntries = monthEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const studyDates = new Set(sortedEntries.map(entry => entry.date));

        let longestStreak = 0;
        let currentStreakCount = 0;
        let tempStreak = 0;

        // Calculate longest streak within the month
        for (let day = 1; day <= today.getDate(); day++) {
            const checkDate = new Date(currentYear, currentMonth, day);
            const dateString = checkDate.toISOString().split('T')[0];
            
            if (studyDates.has(dateString)) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        // Calculate current streak (working backwards from today)
        const todayString = today.toISOString().split('T')[0];
        
        if (studyDates.has(todayString)) {
            // Count consecutive days backwards from today within the current month
            currentStreakCount = 0;
            for (let i = 0; i <= today.getDate() - 1; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                
                // Stop if we go to previous month
                if (checkDate.getMonth() !== currentMonth || checkDate.getFullYear() !== currentYear) {
                    break;
                }
                
                const dateString = checkDate.toISOString().split('T')[0];
                
                if (studyDates.has(dateString)) {
                    currentStreakCount++;
                } else {
                    break;
                }
            }
        } else {
            currentStreakCount = 0;
        }

        return { longestStreak, currentStreak: currentStreakCount };
    }

    // Display empty insights
    displayEmptyInsights() {
        this.updateElement('totalStudyTime', '0h 0m');
        this.updateElement('dailyAverage', '0h 0m');
        this.updateElement('weeklyAverage', '0h 0m');
        this.updateElement('longestStreak', '0 days');
        this.updateElement('currentStreak', '0 days');
        this.updateElement('studyPercentage', '0%');
    }

    // Load charts data
    async loadCharts() {
        if (!studyCharts) return;

        try {
            const { data: entries, error } = await db.getAllEntries();
            
            if (error) {
                console.error('Error loading chart data:', error);
                return;
            }

            studyCharts.updateAllCharts(entries || []);
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update charts colors
        if (studyCharts) {
            setTimeout(() => studyCharts.updateTheme(), 100);
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Tab management
    switchTab(tabName) {
        // Remove active class from all tabs and tab contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // If switching to analytics tab, ensure charts are properly loaded
        if (tabName === 'analytics') {
            setTimeout(() => {
                this.loadCharts();
            }, 100);
        }
        
        // Save active tab preference
        localStorage.setItem('activeTab', tabName);
    }

    loadActiveTab() {
        const activeTab = localStorage.getItem('activeTab') || 'home';
        this.switchTab(activeTab);
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDuration(hours, minutes) {
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('message');
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.classList.remove('hidden');

        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }

    setLoading(loading) {
        const container = document.querySelector('.container');
        if (container) {
            if (loading) {
                container.classList.add('loading');
            } else {
                container.classList.remove('loading');
            }
        }
    }

    // Export data to CSV
    async exportData() {
        try {
            const { data: entries, error } = await db.getAllEntries();
            
            if (error) {
                this.showMessage(`Error exporting data: ${error}`, 'error');
                return;
            }

            if (entries.length === 0) {
                this.showMessage('No data to export.', 'error');
                return;
            }

            // Create CSV content
            const headers = ['Date', 'Hours', 'Minutes', 'Total Minutes', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...entries.map(entry => [
                    entry.date,
                    entry.hours,
                    entry.minutes,
                    entry.total_minutes,
                    entry.created_at
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `minutemind-data-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('Data exported successfully!', 'success');
        } catch (error) {
            this.showMessage(`Error exporting data: ${error.message}`, 'error');
        }
    }
}

// Initialize the application when DOM is loaded or immediately if already loaded
function initializeApp() {
    console.log('Initializing MinuteMind app...');
    window.minuteMind = new MinuteMind();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

// Make it available globally for non-module scripts
window.MinuteMind = MinuteMind;

export { MinuteMind };