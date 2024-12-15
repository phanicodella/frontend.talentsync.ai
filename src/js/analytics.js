class InterviewAnalytics {
    constructor() {
        this.metrics = {
            startTime: null,
            answers: [],
            faceDetectionScores: [],
            speechMetrics: {}
        };
    }

    startSession() {
        this.metrics.startTime = new Date();
        this.metrics.answers = [];
        this.metrics.faceDetectionScores = [];
    }

    recordAnswer(answer) {
        const wordCount = answer.text.split(' ').filter(word => word.length > 0).length;
        const duration = answer.duration;
        
        this.metrics.answers.push({
            questionId: answer.questionId,
            wordCount: wordCount,
            duration: duration,
            wordsPerMinute: (wordCount / duration) * 60,
            faceDetectionScore: answer.faceDetectionScore
        });
    }

    getFinalReport() {
        const totalDuration = (new Date() - this.metrics.startTime) / 1000;
        const averageWordCount = this.metrics.answers.reduce((sum, a) => sum + a.wordCount, 0) / this.metrics.answers.length;
        const averageWordsPerMinute = this.metrics.answers.reduce((sum, a) => sum + a.wordsPerMinute, 0) / this.metrics.answers.length;
        const averageFaceScore = this.metrics.answers.reduce((sum, a) => sum + a.faceDetectionScore, 0) / this.metrics.answers.length;

        return {
            totalDuration,
            averageWordCount,
            averageWordsPerMinute,
            averageFaceScore,
            detailedAnswers: this.metrics.answers
        };
    }
}

window.interviewAnalytics = new InterviewAnalytics();