const api = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.talentsync.tech/api',
    
    async handleResponse(response) {
        const data = await response.json();
        console.log('API Response:', {
            status: response.status,
            data: data
        });
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'API request failed');
        }
        return data;
    },

    async createInterview(candidateData) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(candidateData)
            });
    
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Interview Creation Error:', error);
            throw error;
        }
    },

    async submitAnswer(interviewId, answerData) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    interviewId,
                    ...answerData
                })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Submit Answer Error:', error);
            throw error;
        }
    },

    async endInterview(interviewId) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/${interviewId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('End Interview Error:', error);
            throw error;
        }
    },

    async getInterview(interviewId) {
        try {
            const response = await fetch(`${this.baseURL}/interviews/${interviewId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get Interview Error:', error);
            throw error;
        }
    }
};

window.api = api;
export default api;