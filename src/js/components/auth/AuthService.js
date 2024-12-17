class AuthService {
    constructor() {
        this.baseURL = window.CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        console.log('AuthService initialized with base URL:', this.baseURL);
    }

    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            this._setToken(data.token);
            console.log('Login successful for:', email);
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async candidateAccess(email, name) {
        try {
            console.log('Attempting candidate access for:', email);
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Candidate Access Error:', {
                    status: response.status,
                    body: errorData
                });
                throw new Error(errorData || 'Candidate access failed');
            }

            const data = await response.json();
            this._setToken(data.token);
            console.log('Candidate access successful for:', email);
            return data;
        } catch (error) {
            console.error('Candidate access failed:', error);
            throw error;
        }
    }

    async verifyToken() {
        if (!this.token) {
            console.log('No token available for verification');
            return null;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.token })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Token verification failed');
            }

            const data = await response.json();
            console.log('Token verification successful');
            return data.user;
        } catch (error) {
            console.warn('Token verification failed, logging out');
            this.logout();
            throw error;
        }
    }

    logout() {
        console.log('Logging out and clearing token');
        localStorage.removeItem('token');
        this.token = null;
    }

    getToken() {
        return this.token;
    }

    _setToken(token) {
        if (!token) {
            console.warn('Attempted to set an invalid token');
            return;
        }
        this.token = token;
        localStorage.setItem('token', token);
        console.log('Token set successfully');
    }
}

// Ensure global availability
window.authService = new AuthService();