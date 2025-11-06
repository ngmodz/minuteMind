// Supabase Database Operations
import { SUPABASE_CONFIG } from './config.js';

class StudyDatabase {
    constructor() {
        this.supabase = null;
        this.initSupabase();
    }

    initSupabase() {
        console.log('Initializing Supabase...');
        try {
            console.log('SUPABASE_CONFIG:', SUPABASE_CONFIG);
            if (typeof SUPABASE_CONFIG !== 'undefined' && 
                SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
                SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
                
                // Access the global supabase object from the CDN
                if (typeof window !== 'undefined' && window.supabase) {
                    this.supabase = window.supabase.createClient(
                        SUPABASE_CONFIG.url, 
                        SUPABASE_CONFIG.anonKey,
                        {
                            auth: {
                                autoRefreshToken: true,
                                persistSession: true,
                                detectSessionInUrl: true
                            }
                        }
                    );
                    console.log('Supabase initialized successfully with persistent sessions');
                } else {
                    console.error('Supabase library not found. Make sure the CDN script is loaded.');
                    this.useLocalStorage = true;
                }
            } else {
                console.warn('Supabase not configured. Using local storage fallback.');
                this.useLocalStorage = true;
            }
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.useLocalStorage = true;
        }
    }

    // Get local storage key
    getStorageKey() {
        // Get user ID from the app instance if available
        const app = window.app;
        const userId = app?.currentUser?.id;
        
        if (!userId) {
            console.warn('No user ID available for localStorage key');
            return 'minutemind_entries_anonymous';
        }
        
        return `minutemind_entries_${userId}`;
    }

    // Local storage fallback methods
    getLocalEntries() {
        try {
            const entries = localStorage.getItem(this.getStorageKey());
            return entries ? JSON.parse(entries) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    }

    saveLocalEntries(entries) {
        try {
            localStorage.setItem(this.getStorageKey(), JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Create a new study entry
    async createEntry(date, hours, minutes, userId = null) {
        console.log('createEntry called with:', { date, hours, minutes, userId });
        
        const totalMinutes = (hours * 60) + minutes;
        const entry = {
            date: date,
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            total_minutes: totalMinutes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Add user_id if provided (for Supabase with auth)
        if (userId) {
            entry.user_id = userId;
        }

        console.log('Entry object:', entry);

        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            
            // Check if entry for this date already exists
            const existingIndex = entries.findIndex(e => e.date === date);
            
            if (existingIndex >= 0) {
                // Add to existing entry instead of replacing
                const existingEntry = entries[existingIndex];
                const newTotalMinutes = existingEntry.total_minutes + totalMinutes;
                const newHours = Math.floor(newTotalMinutes / 60);
                const newMinutes = newTotalMinutes % 60;
                
                entry.id = existingEntry.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                entry.created_at = existingEntry.created_at;
                entry.hours = newHours;
                entry.minutes = newMinutes;
                entry.total_minutes = newTotalMinutes;
                entries[existingIndex] = entry;
            } else {
                // Create new entry
                entry.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                entries.push(entry);
            }
            
            if (this.saveLocalEntries(entries)) {
                return { data: entry, error: null };
            } else {
                return { data: null, error: 'Failed to save to local storage' };
            }
        }

        try {
            // Check if entry already exists for this date
            const { data: existingEntry, error: fetchError } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .eq('date', date)
                .maybeSingle();

            console.log('Existing entry check:', { existingEntry, fetchError });

            if (existingEntry) {
                // Add to existing entry instead of replacing
                console.log('Adding to existing entry for date:', date);
                const newTotalMinutes = existingEntry.total_minutes + totalMinutes;
                const newHours = Math.floor(newTotalMinutes / 60);
                const newMinutes = newTotalMinutes % 60;
                
                const { data, error } = await this.supabase
                    .from(SUPABASE_CONFIG.tableName)
                    .update({
                        hours: newHours,
                        minutes: newMinutes,
                        total_minutes: newTotalMinutes,
                        updated_at: new Date().toISOString()
                    })
                    .eq('date', date)
                    .select()
                    .single();

                console.log('Update result:', { data, error });
                if (error) {
                    console.error('Update error details:', error);
                }
                return { data, error };
            } else {
                // Create new entry (user_id will be set automatically by the trigger)
                console.log('Creating new entry for date:', date);
                const { data, error } = await this.supabase
                    .from(SUPABASE_CONFIG.tableName)
                    .insert([entry])
                    .select()
                    .single();

                console.log('Insert result:', { data, error });
                if (error) {
                    console.error('Insert error details:', error);
                }
                return { data, error };
            }
        } catch (error) {
            console.error('Database error in createEntry:', error);
            return { data: null, error: error.message || error };
        }
    }

    // Get all study entries
    async getAllEntries() {
        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            return { data: entries.sort((a, b) => new Date(b.date) - new Date(a.date)), error: null };
        }

        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .order('date', { ascending: false });

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: [], error: error.message };
        }
    }

    // Get entries for a specific month
    async getMonthEntries(year, month) {
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            const monthEntries = entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );
            return { data: monthEntries, error: null };
        }

        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true });

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: [], error: error.message };
        }
    }

    // Update an existing entry
    async updateEntry(id, date, hours, minutes) {
        const totalMinutes = (hours * 60) + minutes;
        const updates = {
            date: date,
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            total_minutes: totalMinutes,
            updated_at: new Date().toISOString()
        };

        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            const index = entries.findIndex(e => e.id === id);
            
            if (index >= 0) {
                entries[index] = { ...entries[index], ...updates };
                if (this.saveLocalEntries(entries)) {
                    return { data: entries[index], error: null };
                } else {
                    return { data: null, error: 'Failed to update local storage' };
                }
            } else {
                return { data: null, error: 'Entry not found' };
            }
        }

        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: null, error: error.message };
        }
    }

    // Delete an entry
    async deleteEntry(id) {
        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            const filteredEntries = entries.filter(e => e.id !== id);
            
            if (this.saveLocalEntries(filteredEntries)) {
                return { error: null };
            } else {
                return { error: 'Failed to delete from local storage' };
            }
        }

        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .delete()
                .eq('id', id);

            return { error };
        } catch (error) {
            console.error('Database error:', error);
            return { error: error.message };
        }
    }

    // Get recent entries (last 10)
    async getRecentEntries(limit = 10) {
        if (this.useLocalStorage || !this.supabase) {
            const entries = this.getLocalEntries();
            return { 
                data: entries
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, limit), 
                error: null 
            };
        }

        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tableName)
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            return { data, error };
        } catch (error) {
            console.error('Database error:', error);
            return { data: [], error: error.message };
        }
    }
}

// Initialize database instance
const db = new StudyDatabase();

// Make it available globally for non-module scripts
window.db = db;

export { StudyDatabase, db };