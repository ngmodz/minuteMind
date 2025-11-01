// Production Environment Configuration
// This file is used for production builds with environment variable injection

// Vite environment variables (prefixed with VITE_)
const viteConfig = {
    SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY,
    SUPABASE_TABLE_NAME: import.meta.env?.VITE_SUPABASE_TABLE_NAME
};

// Webpack environment variables
const webpackConfig = {
    SUPABASE_URL: process.env?.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env?.SUPABASE_ANON_KEY,
    SUPABASE_TABLE_NAME: process.env?.SUPABASE_TABLE_NAME
};

// Default configuration for development
const defaultConfig = {
    SUPABASE_URL: 'https://ypqysfprakbdpiittmsg.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcXlzZnByYWtiZHBpaXR0bXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDA4NjcsImV4cCI6MjA3NzQ3Njg2N30.gipFWGIIjqlm4pfTTYiy7BIylZ1dlJaT30K7ZsFcv3I',
    SUPABASE_TABLE_NAME: 'study_entries'
};

// Function to get configuration from multiple sources
function getConfig() {
    // Try Vite first, then Webpack, then defaults
    const config = {};
    
    Object.keys(defaultConfig).forEach(key => {
        config[key] = 
            viteConfig[key] || 
            webpackConfig[key] || 
            defaultConfig[key];
    });
    
    return config;
}

export { getConfig };