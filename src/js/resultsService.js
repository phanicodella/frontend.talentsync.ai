// frontend/src/js/services/resultsService.js
class ResultsService {
    constructor() {
        this.baseUrl = window.CONFIG.API_BASE_URL;
    }

    async generateReport(interviewId) {
        try {
            const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/export-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            return this._downloadPDF(blob, `interview-report-${interviewId}.pdf`);
        } catch (error) {
            console.error('Report generation failed:', error);
            throw error;
        }
    }

    async shareResults(interviewId, email) {
        try {
            const response = await fetch(`${this.baseUrl}/interviews/${interviewId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to share results');
            }

            return response.json();
        } catch (error) {
            console.error('Sharing results failed:', error);
            throw error;
        }
    }

    formatResults(interview) {
        return {
            candidateInfo: {
                name: interview.candidateName,
                email: interview.candidate,
                date: new Date(interview.startTime).toLocaleDateString(),
                duration: this._formatDuration(interview.duration)
            },
            performance: {
                overallScore: interview.overallScore,
                questionsAnswered: interview.answers.length,
                averageResponseTime: this._calculateAverageResponseTime(interview.answers),
                faceDetectionScore: interview.analytics.faceDetectionScores.reduce((a, b) => a + b, 0) / 
                                  interview.analytics.faceDetectionScores.length
            },
            answers: interview.answers.map(answer => ({
                question: answer.question,
                answer: answer.answer,
                analysis: answer.analysis,
                score: this._calculateAnswerScore(answer.analysis)
            })),
            feedback: interview.finalAnalysis
        };
    }

    _downloadPDF(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    _formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    _calculateAverageResponseTime(answers) {
        if (!answers.length) return 0;
        const totalTime = answers.reduce((sum, answer) => {
            return sum + (new Date(answer.timestamp) - new Date(answer.startTime));
        }, 0);
        return totalTime / answers.length;
    }

    _calculateAnswerScore(analysis) {
        if (!analysis || !analysis.scores) return 0;
        const scores = analysis.scores;
        return Math.round(
            (scores.relevance + scores.clarity + scores.contentDepth + scores.professionalLanguage) / 4
        );
    }
}

window.resultsService = new ResultsService();
