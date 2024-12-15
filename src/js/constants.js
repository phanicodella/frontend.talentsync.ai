const CONFIG = {
    MIN_WORDS_PER_ANSWER: 20,
    MAX_ANSWER_TIME: 120,
    FACE_CHECK_INTERVAL: 1000,
    SPEECH_CONFIDENCE_THRESHOLD: 0.8,
    API_BASE_URL: 'http://localhost:5000/api'
};

const INTERVIEW_STATES = {
    INIT: 'init',
    READY: 'ready',
    IN_PROGRESS: 'in_progress',
    ANSWERING: 'answering',
    COMPLETED: 'completed',
    ERROR: 'error'
};

window.CONFIG = CONFIG;
window.INTERVIEW_STATES = INTERVIEW_STATES;