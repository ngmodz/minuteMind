// Authentication Module
import { SUPABASE_CONFIG } from './config.js';

class AuthManager {
    constructor() {
        console.log('Auth: AuthManager constructor called');
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Initialize Supabase client
            if (typeof window !== 'undefined' && window.supabase) {
                this.supabase = window.supabase.createClient(
                    SUPABASE_CONFIG.url,
                    SUPABASE_CONFIG.anonKey
                );
                console.log('Auth: Supabase client initialized');
            } else {
                console.error('Auth: Supabase library not found');
                return;
            }

            // Check if user is already logged in
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('Auth: User already logged in:', this.currentUser.email);
                this.redirectToApp();
                return;
            }

            // Set up event listeners
            this.setupEventListeners();
            this.setupAuthStateListener();

        } catch (error) {
            console.error('Auth: Failed to initialize:', error);
            this.showMessage('Failed to initialize authentication. Please refresh the page.', 'error');
        }
    }

    setupEventListeners() {
        console.log('Auth: Setting up event listeners...');
        
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                console.log('Auth: Tab clicked:', e.target.dataset.tab);
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        const signinForm = document.getElementById('signinForm');
        if (signinForm) {
            console.log('Auth: Sign in form found, adding event listener');
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Auth: Sign in form submitted');
                this.handleSignIn(e);
            });
        } else {
            console.error('Auth: Sign in form not found!');
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            console.log('Auth: Sign up form found, adding event listener');
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Auth: Sign up form submitted');
                this.handleSignUp(e);
            });
        } else {
            console.error('Auth: Sign up form not found!');
        }

        // Password visibility toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target.dataset.target);
            });
        });

        // Password strength meter for signup
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            // Support both input and contenteditable
            const eventType = signupPassword.tagName === 'INPUT' ? 'input' : 'input';
            signupPassword.addEventListener(eventType, (e) => {
                const value = e.target.textContent ? e.target.textContent.trim() : e.target.value;
                this.updatePasswordStrength(value);
            });
            // Also listen to keyup for contenteditable
            if (signupPassword.classList.contains('contenteditable-input')) {
                signupPassword.addEventListener('keyup', (e) => {
                    this.updatePasswordStrength(e.target.textContent.trim());
                });
            }
        }

        // Real-time password confirmation validation
        const confirmPassword = document.getElementById('signupConfirmPassword');
        if (confirmPassword) {
            const eventType = confirmPassword.tagName === 'INPUT' ? 'input' : 'input';
            confirmPassword.addEventListener(eventType, (e) => {
                this.validatePasswordMatch();
            });
            // Also listen to keyup for contenteditable
            if (confirmPassword.classList.contains('contenteditable-input')) {
                confirmPassword.addEventListener('keyup', (e) => {
                    this.validatePasswordMatch();
                });
            }
        }

        // Forgot password
        const forgotLink = document.getElementById('forgotPasswordLink');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    setupAuthStateListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth: State changed:', event, session);
            
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.showMessage('Successfully signed in! Redirecting...', 'success');
                setTimeout(() => this.redirectToApp(), 1500);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
            }
        });
    }

    switchTab(tabName) {
        // Remove active classes
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

        // Add active classes
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');

        // Clear any messages
        this.hideMessage();
    }

    async handleSignIn(e) {
        e.preventDefault();
        
        // Get values from contenteditable divs or regular inputs
        const emailEl = document.getElementById('signinEmail');
        const passwordEl = document.getElementById('signinPassword');
        
        const email = emailEl.textContent ? emailEl.textContent.trim() : emailEl.value;
        const password = passwordEl.textContent ? passwordEl.textContent.trim() : passwordEl.value;

        if (!email || !password) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('Auth: Sign in successful:', data.user.email);
            // Success message and redirect will be handled by auth state listener

        } catch (error) {
            console.error('Auth: Sign in error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        
        // Get values from contenteditable divs or regular inputs
        const nameEl = document.getElementById('signupName');
        const emailEl = document.getElementById('signupEmail');
        const passwordEl = document.getElementById('signupPassword');
        const confirmPasswordEl = document.getElementById('signupConfirmPassword');
        
        const name = nameEl.textContent ? nameEl.textContent.trim() : nameEl.value;
        const email = emailEl.textContent ? emailEl.textContent.trim() : emailEl.value;
        const password = passwordEl.textContent ? passwordEl.textContent.trim() : passwordEl.value;
        const confirmPassword = confirmPasswordEl.textContent ? confirmPasswordEl.textContent.trim() : confirmPasswordEl.value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            console.log('Auth: Sign up successful:', data);

            if (data.user && !data.user.email_confirmed_at) {
                this.showMessage('Please check your email and click the confirmation link to complete your registration.', 'success');
            } else {
                this.showMessage('Account created successfully! Redirecting...', 'success');
                setTimeout(() => this.redirectToApp(), 1500);
            }

        } catch (error) {
            console.error('Auth: Sign up error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async handleForgotPassword() {
        const emailEl = document.getElementById('signinEmail');
        const email = emailEl.textContent ? emailEl.textContent.trim() : emailEl.value;
        
        if (!email) {
            this.showMessage('Please enter your email address first.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            this.showMessage('Password reset email sent! Please check your inbox.', 'success');

        } catch (error) {
            console.error('Auth: Password reset error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false);
        }
    }

    getErrorMessage(error) {
        switch (error.message) {
            case 'Invalid login credentials':
                return 'Invalid email or password. Please try again.';
            case 'Email not confirmed':
                return 'Please check your email and confirm your account before signing in.';
            case 'User already registered':
                return 'An account with this email already exists.';
            case 'Password should be at least 6 characters':
                return 'Password must be at least 6 characters long.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    }

    showMessage(message, type) {
        const messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = `<div class="message ${type}">${message}</div>`;

        // Auto-hide error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    hideMessage() {
        const messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = '';
    }

    setLoading(loading) {
        const buttons = document.querySelectorAll('.auth-button');
        
        buttons.forEach(btn => {
            if (loading) {
                btn.classList.add('loading');
                btn.disabled = true;
            } else {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    }

    togglePasswordVisibility(targetId) {
        const input = document.getElementById(targetId);
        const toggle = document.querySelector(`[data-target="${targetId}"]`);
        
        // Handle both regular inputs and contenteditable divs
        if (input.tagName === 'INPUT') {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.textContent = '🙈';
            } else {
                input.type = 'password';
                toggle.textContent = '👁️';
            }
        } else if (input.classList.contains('contenteditable-input')) {
            if (input.classList.contains('password-visible')) {
                input.classList.remove('password-visible');
                toggle.textContent = '👁️';
            } else {
                input.classList.add('password-visible');
                toggle.textContent = '🙈';
            }
        }
    }

    updatePasswordStrength(password) {
        const strengthContainer = document.querySelector('.password-strength');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthContainer) return;

        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) strength += 25;
        
        // Uppercase letter
        if (/[A-Z]/.test(password)) strength += 25;
        
        // Lowercase letter
        if (/[a-z]/.test(password)) strength += 25;
        
        // Numbers or special characters
        if (/[\d\W]/.test(password)) strength += 25;

        // Remove existing strength classes
        strengthBar.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
        
        if (strength <= 25) {
            strengthBar.classList.add('strength-weak');
            feedback = 'Weak password';
        } else if (strength <= 50) {
            strengthBar.classList.add('strength-medium');
            feedback = 'Medium strength';
        } else if (strength <= 75) {
            strengthBar.classList.add('strength-medium');
            feedback = 'Good password';
        } else {
            strengthBar.classList.add('strength-strong');
            feedback = 'Strong password';
        }

        strengthText.textContent = feedback;
    }

    validatePasswordMatch() {
        const passwordEl = document.getElementById('signupPassword');
        const confirmPasswordEl = document.getElementById('signupConfirmPassword');
        
        const password = passwordEl.textContent ? passwordEl.textContent.trim() : passwordEl.value;
        const confirmPassword = confirmPasswordEl.textContent ? confirmPasswordEl.textContent.trim() : confirmPasswordEl.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordEl.style.borderColor = '#ef4444';
        } else {
            confirmPasswordEl.style.borderColor = '';
        }
    }

    redirectToApp() {
        window.location.href = 'index.html';
    }

    // Public method to get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Public method to sign out
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            window.location.href = 'auth.html';
        } catch (error) {
            console.error('Auth: Sign out error:', error);
        }
    }
}

// Initialize auth manager when DOM is ready
console.log('Auth: Script loaded, checking DOM state...');
if (document.readyState === 'loading') {
    console.log('Auth: DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Auth: DOMContentLoaded fired, creating AuthManager...');
        window.authManager = new AuthManager();
    });
} else {
    console.log('Auth: DOM already loaded, creating AuthManager immediately...');
    window.authManager = new AuthManager();
}

export { AuthManager };