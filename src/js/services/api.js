// frontend/src/js/services/api.js
const api = {
    baseURL: 'http://localhost:5000/api',
    
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
        console.log('Creating interview with data:', candidateData);
        try {
            const response = await fetch(`${this.baseURL}/interviews/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(candidateData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create Interview Error:', error);
            throw error;
        }
    },

    async submitAnswer(interviewId, answerData) {
        console.log('Submitting answer:', { interviewId, ...answerData });
        try {
            const response = await fetch(`${this.baseURL}/interviews/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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
        console.log('Ending interview:', interviewId);
        try {
            const response = await fetch(`${this.baseURL}/interviews/${interviewId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('End Interview Error:', error);
            throw error;
        }
    },

    async getInterview(interviewId) {
        console.log('Getting interview:', interviewId);
        try {
            const response = await fetch(`${this.baseURL}/interviews/${interviewId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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