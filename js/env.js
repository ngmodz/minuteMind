// Environment Configuration Loader
// This file manages environment variables for the frontend application

class EnvironmentConfig {
    constructor() {
        console.log('EnvironmentConfig constructor called');
        this.config = {};
        this.loadEnvironment();
    }

    loadEnvironment() {
        console.log('Loading environment configuration...');
        // Check if we're in a build environment with injected variables
        if (typeof process !== 'undefined' && process.env) {
            this.config = {
                SUPABASE_URL: process.env.SUPABASE_URL,
                SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
                SUPABASE_TABLE_NAME: process.env.SUPABASE_TABLE_NAME
            };
        } else {
            // Fallback for development - you should replace these with build-time injection
            // In production, use environment variables or a secure configuration service
            this.config = {
                SUPABASE_URL: this.getConfigValue('SUPABASE_URL'),
                SUPABASE_ANON_KEY: this.getConfigValue('SUPABASE_ANON_KEY'),
                SUPABASE_TABLE_NAME: this.getConfigValue('SUPABASE_TABLE_NAME')
            };
        }
        console.log('Environment config loaded:', this.config);
    }

    getConfigValue(key) {
        // This method can be extended to load from various sources:
        // 1. Build-time injected variables
        // 2. Secure configuration endpoint
        // 3. Local storage (for development only)
        
        const defaults = {
            SUPABASE_URL: 'https://ypqysfprakbdpiittmsg.supabase.co',
            SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcXlzZnByYWtiZHBpaXR0bXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDA4NjcsImV4cCI6MjA3NzQ3Njg2N30.gipFWGIIjqlm4pfTTYiy7BIylZ1dlJaT30K7ZsFcv3I',
            SUPABASE_TABLE_NAME: 'study_entries'
        };

        return defaults[key];
    }

    get(key) {
        return this.config[key];
    }

    // Method to check if all required environment variables are set
    validateConfig() {
        const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_TABLE_NAME'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            console.warn('Missing environment variables:', missing);
            return false;
        }
        return true;
    }
}

// Create a global environment instance
console.log('Creating env instance...');
const env = new EnvironmentConfig();
console.log('env instance created:', env);

export { env };