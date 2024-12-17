const Login = {
    data() {
        return {
            email: '',
            password: '',
            name: '',
            isCandidateAccess: true,
            isLoading: false,
            error: null,
            validationErrors: {}
        };
    },

    methods: {
        validateForm() {
            const errors = {};
            
            if (!this.email) {
                errors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
                errors.email = 'Invalid email format';
            }

            if (!this.isCandidateAccess && !this.password) {
                errors.password = 'Password is required';
            }

            if (this.isCandidateAccess && !this.name) {
                errors.name = 'Name is required';
            }

            this.validationErrors = errors;
            return Object.keys(errors).length === 0;
        },

        async handleSubmit() {
            if (!this.validateForm()) return;

            this.isLoading = true;
            this.error = null;

            try {
                let result;
                if (this.isCandidateAccess) {
                    result = await window.authService.candidateAccess(
                        this.email,
                        this.name
                    );
                } else {
                    result = await window.authService.login(
                        this.email,
                        this.password
                    );
                }

                this.$emit('login-success', result.user);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.isLoading = false;
            }
        },

        toggleAccessType() {
            this.isCandidateAccess = !this.isCandidateAccess;
            this.error = null;
            this.validationErrors = {};
        }
    },

    template: `
        <div class="auth-container">
            <div class="auth-box">
                <h2 class="text-center mb-4">{{ isCandidateAccess ? 'Interview Access' : 'Login' }}</h2>

                <div v-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <form @submit.prevent="handleSubmit" class="auth-form">
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input
                            type="email"
                            v-model="email"
                            class="form-control"
                            :class="{ 'is-invalid': validationErrors.email }"
                            placeholder="Enter your email"
                        >
                        <div class="invalid-feedback">{{ validationErrors.email }}</div>
                    </div>

                    <div v-if="isCandidateAccess" class="mb-3">
                        <label class="form-label">Name</label>
                        <input
                            type="text"
                            v-model="name"
                            class="form-control"
                            :class="{ 'is-invalid': validationErrors.name }"
                            placeholder="Enter your name"
                        >
                        <div class="invalid-feedback">{{ validationErrors.name }}</div>
                    </div>

                    <div v-if="!isCandidateAccess" class="mb-3">
                        <label class="form-label">Password</label>
                        <input
                            type="password"
                            v-model="password"
                            class="form-control"
                            :class="{ 'is-invalid': validationErrors.password }"
                            placeholder="Enter your password"
                        >
                        <div class="invalid-feedback">{{ validationErrors.password }}</div>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary w-100"
                        :disabled="isLoading"
                    >
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isCandidateAccess ? 'Start Interview' : 'Login' }}
                    </button>

                    <div class="text-center mt-3">
                        <button 
                            type="button" 
                            class="btn btn-link"
                            @click="toggleAccessType"
                        >
                            {{ isCandidateAccess ? 'Admin Login' : 'Candidate Access' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};

window.Login = Login;