// Todo List Manager
import { todoDb } from './todoDb.js';

class TodoManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTodos();
    }

    setupEventListeners() {
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => this.handleTodoSubmit(e));
        }

        const todoInput = document.getElementById('todoInput');
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    todoForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    async handleTodoSubmit(e) {
        e.preventDefault();
        
        const todoInput = document.getElementById('todoInput');
        const text = todoInput.value.trim();

        if (!text) {
            return;
        }

        const app = window.minuteMind;
        const userId = app?.currentUser?.id;

        try {
            const { data, error } = await todoDb.createTodo(text, userId);
            
            if (error) {
                this.showTodoMessage(`Error: ${error}`, 'error');
            } else {
                todoInput.value = '';
                await this.loadTodos();
            }
        } catch (error) {
            console.error('Exception during todo submit:', error);
            this.showTodoMessage(`Error: ${error.message}`, 'error');
        }
    }

    async loadTodos() {
        try {
            const { data: todos, error } = await todoDb.getAllTodos();
            
            if (error) {
                console.error('Error loading todos:', error);
                this.showTodoMessage('Error loading todos. Please try refreshing.', 'error');
                return;
            }

            this.displayTodos(todos || []);
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showTodoMessage('Error loading todos. Please try refreshing.', 'error');
        }
    }

    displayTodos(todos) {
        const container = document.getElementById('todoList');
        if (!container) return;

        if (todos.length === 0) {
            container.innerHTML = '<p class="text-muted">No tasks yet. Add your first task!</p>';
            return;
        }

        const activeTodos = todos.filter(t => !t.completed);
        const completedTodos = todos.filter(t => t.completed);

        container.innerHTML = `
            ${activeTodos.length > 0 ? `
                <div class="todo-section">
                    <h3 class="todo-section-title">Active Tasks (${activeTodos.length})</h3>
                    ${activeTodos.map(todo => this.createTodoHTML(todo)).join('')}
                </div>
            ` : ''}
            
            ${completedTodos.length > 0 ? `
                <div class="todo-section">
                    <h3 class="todo-section-title">Completed (${completedTodos.length})</h3>
                    ${completedTodos.map(todo => this.createTodoHTML(todo)).join('')}
                </div>
            ` : ''}
        `;

        this.attachTodoEventListeners();
    }

    createTodoHTML(todo) {
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" 
                       class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''} 
                       data-id="${todo.id}">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="todo-delete" data-id="${todo.id}" aria-label="Delete task">
                    🗑️
                </button>
            </div>
        `;
    }

    attachTodoEventListeners() {
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleToggleTodo(e.target.dataset.id);
            });
        });

        document.querySelectorAll('.todo-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleDeleteTodo(e.target.dataset.id);
            });
        });
    }

    async handleToggleTodo(id) {
        try {
            const { error } = await todoDb.toggleTodo(id);
            
            if (error) {
                this.showTodoMessage(`Error: ${error}`, 'error');
            } else {
                await this.loadTodos();
            }
        } catch (error) {
            console.error('Exception during toggle todo:', error);
            this.showTodoMessage(`Error: ${error.message}`, 'error');
        }
    }

    async handleDeleteTodo(id) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const { error } = await todoDb.deleteTodo(id);
            
            if (error) {
                this.showTodoMessage(`Error: ${error}`, 'error');
            } else {
                await this.loadTodos();
            }
        } catch (error) {
            console.error('Exception during delete todo:', error);
            this.showTodoMessage(`Error: ${error.message}`, 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTodoMessage(message, type) {
        const messageElement = document.getElementById('todoMessage');
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.classList.remove('hidden');

        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
}

export { TodoManager };
