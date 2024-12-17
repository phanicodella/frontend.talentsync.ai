window.utils = {
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    calculateWordCount(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    generateInterviewId() {
        return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    sanitizeText(text) {
        return text.trim().replace(/\s\s+/g, ' ');
    }
};