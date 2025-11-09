// Todo Database Operations
import { SUPABASE_CONFIG } from './config.js';

class TodoDatabase {
    constructor() {
        this.supabase = null;
        this.initSupabase();
    }

    initSupabase() {
        try {
            if (typeof SUPABASE_CONFIG !== 'undefined' && 
                SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
                SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
                
                if (typeof window !== 'undefined' && window.supabase) {
                    this.supabase = window.supabase.createClient(
                        SUPABASE_CONFIG.url, 
                        SUPABASE_CONFIG.anonKey
                    );
                } else {
                    this.useLocalStorage = true;
                }
            } else {
                this.useLocalStorage = true;
            }
        } catch (error) {
            console.error('Failed to initialize Todo Supabase:', error);
            this.useLocalStorage = true;
        }
    }

    getStorageKey() {
        const app = window.minuteMind;
        const userId = app?.currentUser?.id;
        return userId ? `minutemind_todos_${userId}` : 'minutemind_todos_anonymous';
    }

    getLocalTodos() {
        try {
            const todos = localStorage.getItem(this.getStorageKey());
            return todos ? JSON.parse(todos) : [];
        } catch (error) {
            console.error('Error reading todos from localStorage:', error);
            return [];
        }
    }

    saveLocalTodos(todos) {
        try {
            localStorage.setItem(this.getStorageKey(), JSON.stringify(todos));
            return true;
        } catch (error) {
            console.error('Error saving todos to localStorage:', error);
            return false;
        }
    }

    async createTodo(text, userId = null) {
        const todo = {
            text: text,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (userId) {
            todo.user_id = userId;
        }

        if (this.useLocalStorage || !this.supabase) {
            const todos = this.getLocalTodos();
            todo.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            todos.push(todo);
            
            if (this.saveLocalTodos(todos)) {
                return { data: todo, error: null };
            } else {
                return { data: null, error: 'Failed to save to local storage' };
            }
        }

        try {
            const { data, error } = await this.supabase
                .from('todos')
                .insert([todo])
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error('Database error in createTodo:', error);
            return { data: null, error: error.message || error };
        }
    }

    async getAllTodos() {
        if (this.useLocalStorage || !this.supabase) {
            const todos = this.getLocalTodos();
            return { data: todos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), error: null };
        }

        try {
            const { data, error } = await this.supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: [], error: error.message };
        }
    }

    async toggleTodo(id) {
        if (this.useLocalStorage || !this.supabase) {
            const todos = this.getLocalTodos();
            const index = todos.findIndex(t => t.id === id);
            
            if (index >= 0) {
                todos[index].completed = !todos[index].completed;
                todos[index].updated_at = new Date().toISOString();
                if (this.saveLocalTodos(todos)) {
                    return { data: todos[index], error: null };
                } else {
                    return { data: null, error: 'Failed to update local storage' };
                }
            } else {
                return { data: null, error: 'Todo not found' };
            }
        }

        try {
            const { data: currentTodo } = await this.supabase
                .from('todos')
                .select('completed')
                .eq('id', id)
                .single();

            const { data, error } = await this.supabase
                .from('todos')
                .update({ 
                    completed: !currentTodo.completed,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: null, error: error.message };
        }
    }

    async deleteTodo(id) {
        if (this.useLocalStorage || !this.supabase) {
            const todos = this.getLocalTodos();
            const filteredTodos = todos.filter(t => t.id !== id);
            
            if (this.saveLocalTodos(filteredTodos)) {
                return { error: null };
            } else {
                return { error: 'Failed to delete from local storage' };
            }
        }

        try {
            const { error } = await this.supabase
                .from('todos')
                .delete()
                .eq('id', id);

            return { error };
        } catch (error) {
            console.error('Database error:', error);
            return { error: error.message };
        }
    }
}

const todoDb = new TodoDatabase();
window.todoDb = todoDb;

export { TodoDatabase, todoDb };
