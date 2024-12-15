const Login = {
    data() {
        return {
            email: '',
            password: '',
            errorMessage: '',
            successMessage: ''
        };
    },
    methods: {
        async handleLogin() {
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Login failed');
                }

                const data = await response.json();
                this.successMessage = data.message;
                localStorage.setItem('token', data.token);
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.successMessage = '';
            }
        }
    },
    template: `
        <div class="container mt-5">
            <h2>Login to TalentSync</h2>
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" v-model="email" class="form-control" id="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" v-model="password" class="form-control" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    `
};

export default Login;
