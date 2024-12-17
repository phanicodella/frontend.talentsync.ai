window.authService = {
    token: null,
    baseURL: 'http://localhost:5000/api',

    async candidateAccess(email, name) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Authentication failed');
            }

            const data = await response.json();
            this.token = data.token;
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    },

    getToken() {
        return this.token || localStorage.getItem('token');
    },

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }
};
