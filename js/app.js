// Main Application JavaScript
class MinuteMind {
    constructor() {
        this.currentEditingId = null;
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

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.setTodayDate();
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
    }

    setupEventListeners() {
        // Study form submission
        const studyForm = document.getElementById('studyForm');
        if (studyForm) {
            studyForm.addEventListener('submit', (e) => this.handleStudySubmit(e));
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Export data button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Add new entry button
        const addNewEntryBtn = document.getElementById('addNewEntry');
        if (addNewEntryBtn) {
            addNewEntryBtn.addEventListener('click', () => this.openNewEntryModal());
        }

        // Edit modal events
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        }

        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        const deleteEntry = document.getElementById('deleteEntry');
        if (deleteEntry) {
            deleteEntry.addEventListener('click', () => this.handleDelete());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
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
            const { data, error } = await db.createEntry(date, hours, minutes);
            
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
            <div class="entry-item" onclick="minuteMind.openEditModal('${entry.id}', '${entry.date}', ${entry.hours}, ${entry.minutes})">
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

        const dailyAverage = daysStudied > 0 ? totalMinutes / daysStudied : 0;
        const dailyAvgHours = Math.floor(dailyAverage / 60);
        const dailyAvgMins = Math.round(dailyAverage % 60);

        // Calculate weekly average
        const weeksInMonth = Math.ceil(daysInMonth / 7);
        const weeklyAverage = totalMinutes / weeksInMonth;
        const weeklyAvgHours = Math.floor(weeklyAverage / 60);
        const weeklyAvgMins = Math.round(weeklyAverage % 60);

        // Calculate streaks
        const { longestStreak, currentStreak } = this.calculateStreaks(entries);

        // Update DOM
        this.updateElement('totalStudyTime', `${totalHours}h ${remainingMinutes}m`);
        this.updateElement('dailyAverage', `${dailyAvgHours}h ${dailyAvgMins}m`);
        this.updateElement('weeklyAverage', `${weeklyAvgHours}h ${weeklyAvgMins}m`);
        this.updateElement('longestStreak', `${longestStreak} days`);
        this.updateElement('currentStreak', `${currentStreak} days`);
        this.updateElement('studyPercentage', `${studyPercentage}%`);
    }

    // Calculate study streaks
    calculateStreaks(entries) {
        if (entries.length === 0) return { longestStreak: 0, currentStreak: 0 };

        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const studyDates = new Set(sortedEntries.map(entry => entry.date));

        let longestStreak = 0;
        let currentStreak = 0;
        let streakCount = 0;

        // Calculate longest streak
        const startDate = new Date(sortedEntries[0].date);
        const endDate = new Date();
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateString = date.toISOString().split('T')[0];
            
            if (studyDates.has(dateString)) {
                streakCount++;
                longestStreak = Math.max(longestStreak, streakCount);
            } else {
                streakCount = 0;
            }
        }

        // Calculate current streak
        const today = new Date();
        for (let i = 0; i < 365; i++) { // Check up to a year back
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toISOString().split('T')[0];
            
            if (studyDates.has(dateString)) {
                currentStreak++;
            } else {
                break;
            }
        }

        return { longestStreak, currentStreak };
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

    // Open edit modal for new entry
    openNewEntryModal() {
        this.currentEditingId = null;
        
        document.getElementById('editEntryId').value = '';
        document.getElementById('editDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('editHours').value = 0;
        document.getElementById('editMinutes').value = 0;
        
        // Change modal title for new entry
        const modalTitle = document.querySelector('#editModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Study Entry';
        }
        
        // Hide delete button for new entries
        const deleteBtn = document.getElementById('deleteEntry');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        document.getElementById('editModal').classList.remove('hidden');
    }

    // Open edit modal
    openEditModal(id, date, hours, minutes) {
        this.currentEditingId = id;
        
        document.getElementById('editEntryId').value = id;
        
        // If no date is provided, use today's date
        const editDate = date || new Date().toISOString().split('T')[0];
        document.getElementById('editDate').value = editDate;
        
        document.getElementById('editHours').value = hours || 0;
        document.getElementById('editMinutes').value = minutes || 0;
        
        // Change modal title for editing
        const modalTitle = document.querySelector('#editModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Study Entry';
        }
        
        // Show delete button for existing entries
        const deleteBtn = document.getElementById('deleteEntry');
        if (deleteBtn) {
            deleteBtn.style.display = 'block';
        }
        
        document.getElementById('editModal').classList.remove('hidden');
    }

    // Close edit modal
    closeModal() {
        document.getElementById('editModal').classList.add('hidden');
        this.currentEditingId = null;
    }

    // Handle edit form submission
    async handleEditSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const id = formData.get('id') || this.currentEditingId;
        const date = formData.get('date');
        const hours = parseInt(formData.get('hours')) || 0;
        const minutes = parseInt(formData.get('minutes')) || 0;

        if (hours === 0 && minutes === 0) {
            this.showMessage('Please enter a valid study time.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            let result;
            
            if (id && this.currentEditingId) {
                // Update existing entry
                result = await db.updateEntry(id, date, hours, minutes);
                if (result.error) {
                    this.showMessage(`Error updating entry: ${result.error}`, 'error');
                } else {
                    this.showMessage('Entry updated successfully!', 'success');
                }
            } else {
                // Create new entry
                result = await db.createEntry(date, hours, minutes);
                if (result.error) {
                    this.showMessage(`Error creating entry: ${result.error}`, 'error');
                } else {
                    this.showMessage('Entry created successfully!', 'success');
                }
            }
            
            if (!result.error) {
                this.closeModal();
                await this.loadDashboard();
                await this.loadCharts();
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Handle delete entry
    async handleDelete() {
        if (!this.currentEditingId) return;

        if (!confirm('Are you sure you want to delete this entry?')) return;

        this.setLoading(true);

        try {
            const { error } = await db.deleteEntry(this.currentEditingId);
            
            if (error) {
                this.showMessage(`Error deleting entry: ${error}`, 'error');
            } else {
                this.showMessage('Entry deleted successfully!', 'success');
                this.closeModal();
                await this.loadDashboard();
                await this.loadCharts();
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.minuteMind = new MinuteMind();
});