// Daybook JavaScript - Calendar and Task Management
import { db } from './supabase.js';
import { SUPABASE_CONFIG } from './config.js';

class Daybook {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.tasks = {};
        this.editingTaskId = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Daybook initializing...');
            
            // Initialize Supabase
            if (typeof window !== 'undefined' && window.supabase) {
                this.supabase = window.supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey
                );
            }

            // Check authentication
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                return;
            }

            this.setupEventListeners();
            this.loadTheme();
            this.showUserStatus();
            await this.loadAllTasks();
            this.renderCalendar();
            this.updateTasksDisplay();
            
            console.log('Daybook initialized successfully');
        } catch (error) {
            console.error('Error initializing Daybook:', error);
        }
    }

    async checkAuthentication() {
        try {
            if (!this.supabase) {
                window.location.href = '../auth.html';
                return false;
            }
            
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError || !session) {
                window.location.href = '../auth.html';
                return false;
            }
            
            this.currentUser = session.user;
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '../auth.html';
            return false;
        }
    }

    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

        // Task modal
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Sign out
        const signOutBtn = document.getElementById('signOut');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }

        // Close modal on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const button = this.createDayButton(day, true, year, month - 1);
            calendarGrid.appendChild(button);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === today.getDate();
            const button = this.createDayButton(day, false, year, month, isToday);
            calendarGrid.appendChild(button);
        }

        // Next month days
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const button = this.createDayButton(day, true, year, month + 1);
            calendarGrid.appendChild(button);
        }
    }

    createDayButton(day, isOtherMonth, year, month, isToday = false) {
        const button = document.createElement('button');
        button.className = 'calendar-day';
        button.textContent = day;

        if (isOtherMonth) {
            button.classList.add('other-month');
        } else {
            const dateKey = this.getDateKey(new Date(year, month, day));
            const selectedKey = this.getDateKey(this.selectedDate);

            if (isToday) {
                button.classList.add('today');
            }

            if (dateKey === selectedKey) {
                button.classList.add('selected');
            }

            // Check if this date has tasks
            if (this.tasks[dateKey] && this.tasks[dateKey].length > 0) {
                button.classList.add('has-tasks');
            }

            button.addEventListener('click', () => {
                // Remove any existing selected class immediately for smooth transition
                document.querySelectorAll('.calendar-day.selected').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Update the selected date and display tasks
                this.selectedDate = new Date(year, month, day);
                this.updateTasksDisplay();
            });
        }

        return button;
    }

    getDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateDisplay(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    async loadAllTasks() {
        try {
            const { data, error } = await this.supabase
                .from('daybook_tasks')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Organize tasks by date
            this.tasks = {};
            if (data) {
                data.forEach(task => {
                    const dateKey = task.task_date;
                    if (!this.tasks[dateKey]) {
                        this.tasks[dateKey] = [];
                    }
                    this.tasks[dateKey].push(task);
                });
            }

            console.log('Tasks loaded:', this.tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    updateTasksDisplay() {
        const dateKey = this.getDateKey(this.selectedDate);
        const tasksForDate = this.tasks[dateKey] || [];

        // Update title
        const title = document.getElementById('tasksTitle');
        title.textContent = `Tasks for ${this.formatDateDisplay(this.selectedDate)}`;

        // Update tasks container
        const container = document.getElementById('tasksContainer');
        
        if (tasksForDate.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h4>No tasks scheduled</h4>
                    <p>Click "Add Task" to create your first task for this date</p>
                </div>
            `;
        } else {
            container.innerHTML = tasksForDate.map(task => this.createTaskHTML(task)).join('');
            
            // Attach event listeners
            tasksForDate.forEach(task => {
                const checkbox = document.querySelector(`[data-task-id="${task.id}"] .task-checkbox`);
                checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));

                const editBtn = document.querySelector(`[data-task-id="${task.id}"] .edit-btn`);
                editBtn.addEventListener('click', () => this.editTask(task.id));

                const deleteBtn = document.querySelector(`[data-task-id="${task.id}"] .delete-btn`);
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            });
        }
    }

    createTaskHTML(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="task-content">
                    <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn">✏️ Edit</button>
                    <button class="task-action-btn delete delete-btn">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');

        if (task) {
            modalTitle.textContent = 'Edit Task';
            taskTitle.value = task.title;
            taskDescription.value = task.description || '';
            this.editingTaskId = task.id;
        } else {
            modalTitle.textContent = 'Add Task';
            taskTitle.value = '';
            taskDescription.value = '';
            this.editingTaskId = null;
        }

        modal.classList.add('active');
        taskTitle.focus();
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        this.editingTaskId = null;
    }

    async handleTaskSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();

        if (!title) return;

        const dateKey = this.getDateKey(this.selectedDate);

        try {
            if (this.editingTaskId) {
                // Update existing task
                const { error } = await this.supabase
                    .from('daybook_tasks')
                    .update({ title, description })
                    .eq('id', this.editingTaskId);

                if (error) throw error;

                // Update local data
                const taskIndex = this.tasks[dateKey].findIndex(t => t.id === this.editingTaskId);
                if (taskIndex !== -1) {
                    this.tasks[dateKey][taskIndex].title = title;
                    this.tasks[dateKey][taskIndex].description = description;
                }
            } else {
                // Create new task
                const { data, error } = await this.supabase
                    .from('daybook_tasks')
                    .insert({
                        user_id: this.currentUser.id,
                        task_date: dateKey,
                        title,
                        description,
                        completed: false
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Add to local data
                if (!this.tasks[dateKey]) {
                    this.tasks[dateKey] = [];
                }
                this.tasks[dateKey].push(data);
            }

            this.closeTaskModal();
            this.renderCalendar();
            this.updateTasksDisplay();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task. Please try again.');
        }
    }

    async toggleTaskComplete(taskId) {
        const dateKey = this.getDateKey(this.selectedDate);
        const task = this.tasks[dateKey].find(t => t.id === taskId);
        
        if (!task) return;

        try {
            const newCompletedState = !task.completed;
            
            const { error } = await this.supabase
                .from('daybook_tasks')
                .update({ completed: newCompletedState })
                .eq('id', taskId);

            if (error) throw error;

            task.completed = newCompletedState;
            this.updateTasksDisplay();
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    editTask(taskId) {
        const dateKey = this.getDateKey(this.selectedDate);
        const task = this.tasks[dateKey].find(t => t.id === taskId);
        
        if (task) {
            this.openTaskModal(task);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const dateKey = this.getDateKey(this.selectedDate);

        try {
            const { error } = await this.supabase
                .from('daybook_tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            // Remove from local data
            this.tasks[dateKey] = this.tasks[dateKey].filter(t => t.id !== taskId);
            
            this.renderCalendar();
            this.updateTasksDisplay();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        }
    }

    showUserStatus() {
        const statusElement = document.getElementById('userStatus');
        if (!statusElement || !this.currentUser) return;
        
        const email = this.currentUser.email;
        const username = email.split('@')[0];
        
        statusElement.textContent = `👤 ${username}`;
        statusElement.className = 'user-status authenticated';
        statusElement.title = email;
    }

    async signOut() {
        try {
            if (!this.supabase) {
                window.location.href = '../auth.html';
                return;
            }
            
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
            } else {
                window.location.href = '../auth.html';
            }
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
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
}

// Initialize when DOM is ready
function initializeDaybook() {
    console.log('Initializing Daybook...');
    window.daybook = new Daybook();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDaybook);
} else {
    initializeDaybook();
}

export { Daybook };

