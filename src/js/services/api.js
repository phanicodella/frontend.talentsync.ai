window.api = {
    baseURL: 'http://localhost:5000/api',
    
    async createInterview(candidateData) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authService.getToken()}`
                },
                body: JSON.stringify(candidateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create interview');
            }

            return await response.json();
        } catch (error) {
            console.error('Interview creation failed:', error);
            throw error;
        }
    },

    async submitAnswer(interviewId, answerData) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authService.getToken()}`
                },
                body: JSON.stringify({
                    interviewId,
                    ...answerData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit answer');
            }

            return await response.json();
        } catch (error) {
            console.error('Answer submission failed:', error);
            throw error;
        }
    },

    async endInterview(interviewId) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/${interviewId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authService.getToken()}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to end interview');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to end interview:', error);
            throw error;
        }
    }
};
