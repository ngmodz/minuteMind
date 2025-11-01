// MinuteMind Production Bundle - Standalone version without ES6 modules
(function() {
    'use strict';
    console.log('📦 Loading MinuteMind production bundle...');
    
    const CONFIG = window.MINUTEMIND_CONFIG || {
        SUPABASE_URL: 'https://ypqysfprakbdpiittmsg.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcXlzZnByYWtiZHBpaXR0bXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDA4NjcsImV4cCI6MjA3NzQ3Njg2N30.gipFWGIIjqlm4pfTTYiy7BIylZ1dlJaT30K7ZsFcv3I',
        SUPABASE_TABLE_NAME: 'study_entries'
    };
    
    let currentUser = null;
    
    class Database {
        constructor() {
            this.supabase = window.supabaseClient || window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        }
        
        async createEntry(date, hours, minutes, userId) {
            const totalMinutes = (hours * 60) + minutes;
            const entry = { date, hours: parseInt(hours), minutes: parseInt(minutes), total_minutes: totalMinutes, user_id: userId };
            
            try {
                const { data: existing } = await this.supabase.from(CONFIG.SUPABASE_TABLE_NAME).select('*').eq('date', date).eq('user_id', userId).single();
                
                if (existing) {
                    const { data, error } = await this.supabase.from(CONFIG.SUPABASE_TABLE_NAME).update({ hours: parseInt(hours), minutes: parseInt(minutes), total_minutes: totalMinutes, updated_at: new Date().toISOString() }).eq('date', date).eq('user_id', userId).select().single();
                    return { data, error };
                } else {
                    const { data, error } = await this.supabase.from(CONFIG.SUPABASE_TABLE_NAME).insert([entry]).select().single();
                    return { data, error };
                }
            } catch (error) {
                return { data: null, error: error.message };
            }
        }
        
        async getAllEntries() {
            try {
                const { data, error } = await this.supabase.from(CONFIG.SUPABASE_TABLE_NAME).select('*').order('date', { ascending: false });
                return { data, error };
            } catch (error) {
                return { data: [], error: error.message };
            }
        }
        
        async clearAllStudyData() {
            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user) {
                    const { error } = await this.supabase.from(CONFIG.SUPABASE_TABLE_NAME).delete().eq('user_id', user.id);
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: 'All study data cleared' };
                }
                return { success: false, message: 'No user found' };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }
    }

    
    class MinuteMindApp {
        constructor() {
            this.db = new Database();
            this.charts = {};
            this.motivationalQuotes = ["The expert in anything was once a beginner.", "Success is the sum of small efforts repeated day in and day out.", "The only way to do great work is to love what you do.", "Learning never exhausts the mind.", "Education is the most powerful weapon which you can use to change the world."];
            this.init();
        }
        
        async init() {
            console.log('🚀 Initializing MinuteMind...');
            try {
                const isAuth = await this.checkAuth();
                if (!isAuth) return;
                
                this.setupEventListeners();
                this.updateDateTime();
                this.showUserStatus();
                this.showDailyQuote();
                this.loadDashboard();
                this.initCharts();
                setInterval(() => this.updateDateTime(), 1000);
                this.loadTheme();
                console.log('✅ MinuteMind initialized successfully');
            } catch (error) {
                console.error('Initialization error:', error);
                this.showError('Failed to initialize app');
            }
        }
        
        async checkAuth() {
            try {
                const { data: { session }, error } = await this.db.supabase.auth.getSession();
                if (error || !session) {
                    console.log('No session, redirecting to auth...');
                    window.location.href = 'auth-check.html';
                    return false;
                }
                currentUser = session.user;
                console.log('✅ User authenticated:', currentUser.email);
                return true;
            } catch (error) {
                console.error('Auth check failed:', error);
                window.location.href = 'auth-check.html';
                return false;
            }
        }

        
        setupEventListeners() {
            const form = document.getElementById('studyForm');
            if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            const signOutBtn = document.getElementById('signOut');
            if (signOutBtn) signOutBtn.addEventListener('click', () => this.signOut());
            
            const exportBtn = document.getElementById('exportData');
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
            
            const clearBtn = document.getElementById('clearAllData');
            if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllData());
            
            const darkModeBtn = document.getElementById('darkModeToggle');
            if (darkModeBtn) darkModeBtn.addEventListener('click', () => this.toggleTheme());
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.closest('.tab-btn').dataset.tab;
                    this.switchTab(tab);
                });
            });
        }
        
        updateDateTime() {
            const now = new Date();
            const timeEl = document.getElementById('currentTime');
            if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            
            const dateEl = document.getElementById('currentDate');
            if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const dateInput = document.getElementById('studyDate');
            if (dateInput && !dateInput.value) dateInput.value = now.toISOString().split('T')[0];
        }
        
        showUserStatus() {
            const statusEl = document.getElementById('userStatus');
            const emailEl = document.getElementById('userEmail');
            if (statusEl && currentUser) statusEl.classList.remove('hidden');
            if (emailEl && currentUser) {
                const username = currentUser.email.split('@')[0];
                emailEl.textContent = `👤 ${username}`;
                emailEl.title = currentUser.email;
            }
        }
        
        showDailyQuote() {
            const quoteEl = document.getElementById('dailyQuote');
            if (quoteEl) {
                const today = new Date();
                const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
                const index = dayOfYear % this.motivationalQuotes.length;
                quoteEl.textContent = this.motivationalQuotes[index];
            }
        }

        
        async handleSubmit(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const date = formData.get('date');
            const hours = parseInt(formData.get('hours')) || 0;
            const minutes = parseInt(formData.get('minutes')) || 0;
            
            if (hours === 0 && minutes === 0) {
                this.showMessage('Please enter a valid study time', 'error');
                return;
            }
            if (hours < 0 || minutes < 0 || hours > 24 || minutes > 59) {
                this.showMessage('Invalid time values', 'error');
                return;
            }
            
            try {
                const { data, error } = await this.db.createEntry(date, hours, minutes, currentUser.id);
                if (error) {
                    this.showMessage(`Error: ${error}`, 'error');
                } else {
                    this.showMessage('Study time logged successfully!', 'success');
                    document.getElementById('hours').value = 0;
                    document.getElementById('minutes').value = 0;
                    await this.loadDashboard();
                    await this.updateCharts();
                }
            } catch (error) {
                this.showMessage(`Error: ${error.message}`, 'error');
            }
        }
        
        async signOut() {
            try {
                const { error } = await this.db.supabase.auth.signOut();
                if (error) this.showMessage('Error signing out', 'error');
                else window.location.href = 'auth-check.html';
            } catch (error) {
                this.showMessage('Error signing out', 'error');
            }
        }
        
        async clearAllData() {
            if (!confirm('⚠️ This will permanently delete ALL your study data. Are you sure?')) return;
            try {
                const result = await this.db.clearAllStudyData();
                if (result.success) {
                    this.showMessage('✅ All data cleared', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    this.showMessage(`❌ ${result.message}`, 'error');
                }
            } catch (error) {
                this.showMessage('Error clearing data', 'error');
            }
        }

        
        async loadDashboard() {
            try {
                const { data: entries, error } = await this.db.getAllEntries();
                if (error) {
                    console.error('Error loading entries:', error);
                    return;
                }
                this.displayRecentEntries(entries || []);
                this.calculateInsights(entries || []);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }
        
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
        
        calculateInsights(entries) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthEntries = entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
            });
            const totalMinutes = monthEntries.reduce((sum, entry) => sum + entry.total_minutes, 0);
            const totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            const daysStudied = monthEntries.length;
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const studyPercentage = Math.round((daysStudied / daysInMonth) * 100);
            const dailyAverage = daysStudied > 0 ? totalMinutes / daysStudied : 0;
            const dailyAvgHours = Math.floor(dailyAverage / 60);
            const dailyAvgMins = Math.round(dailyAverage % 60);
            
            this.updateElement('totalStudyTime', `${totalHours}h ${remainingMinutes}m`);
            this.updateElement('dailyAverage', `${dailyAvgHours}h ${dailyAvgMins}m`);
            this.updateElement('studyPercentage', `${studyPercentage}%`);
            this.updateElement('todayHours', totalHours);
            this.updateElement('monthHours', totalHours);
            this.updateElement('totalHours', Math.floor(entries.reduce((sum, e) => sum + e.total_minutes, 0) / 60));
        }

        
        initCharts() {
            const chartIds = ['dailyChart', 'cumulativeChart', 'weeklyChart', 'trendChart'];
            chartIds.forEach(id => {
                const canvas = document.getElementById(id);
                if (canvas && window.Chart) {
                    const ctx = canvas.getContext('2d');
                    this.charts[id] = new Chart(ctx, {
                        type: 'line',
                        data: { labels: [], datasets: [{ label: 'Study Hours', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
                    });
                }
            });
            this.updateCharts();
        }
        
        async updateCharts() {
            try {
                const { data: entries } = await this.db.getAllEntries();
                if (!entries || entries.length === 0) return;
                const last30Days = entries.slice(0, 30).reverse();
                const dailyChart = this.charts['dailyChart'];
                if (dailyChart) {
                    dailyChart.data.labels = last30Days.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    dailyChart.data.datasets[0].data = last30Days.map(e => (e.total_minutes / 60).toFixed(2));
                    dailyChart.update();
                }
            } catch (error) {
                console.error('Error updating charts:', error);
            }
        }
        
        switchTab(tabName) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.toggle('active', content.id === `${tabName}-tab`));
            if (tabName === 'analytics') setTimeout(() => this.updateCharts(), 100);
        }
        
        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            const icon = document.querySelector('#darkModeToggle');
            if (icon) icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        loadTheme() {
            const saved = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', saved);
            const icon = document.querySelector('#darkModeToggle');
            if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
        }

        
        async exportData() {
            try {
                const { data: entries } = await this.db.getAllEntries();
                if (!entries || entries.length === 0) {
                    this.showMessage('No data to export', 'error');
                    return;
                }
                const headers = ['Date', 'Hours', 'Minutes', 'Total Minutes'];
                const csv = [headers.join(','), ...entries.map(e => [e.date, e.hours, e.minutes, e.total_minutes].join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `minutemind-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                this.showMessage('Data exported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error exporting data', 'error');
            }
        }
        
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }
        
        formatDuration(hours, minutes) {
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        }
        
        updateElement(id, content) {
            const el = document.getElementById(id);
            if (el) el.textContent = content;
        }
        
        showMessage(text, type = 'info') {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = text;
                messageEl.className = `message ${type}`;
                messageEl.classList.remove('hidden');
                setTimeout(() => messageEl.classList.add('hidden'), 5000);
            }
        }
        
        showError(text) {
            console.error(text);
            this.showMessage(text, 'error');
        }
    }
    
    window.MinuteMindApp = MinuteMindApp;
    window.app = new MinuteMindApp();
    console.log('✅ Production bundle loaded successfully');
})();
