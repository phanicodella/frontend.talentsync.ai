const CONFIG = {
    MIN_WORDS_PER_ANSWER: 20,
    MAX_ANSWER_TIME: 120,
    FACE_CHECK_INTERVAL: 1000,
    SPEECH_CONFIDENCE_THRESHOLD: 0.8,
    API_BASE_URL: 'http://localhost:5000/api',
    DAILY_APP_URL: 'https://talentsync.daily.co',
    VIDEO_CONSTRAINTS: {
        audio: true,
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    }
};

const INTERVIEW_STATES = {
    INIT: 'init',
    READY: 'ready',
    IN_PROGRESS: 'in_progress',
    ANSWERING: 'answering',
    COMPLETED: 'completed',
    ERROR: 'error'
};

const ERROR_MESSAGES = {
    CAMERA_PERMISSION: 'Please allow camera access to proceed with the interview',
    MIC_PERMISSION: 'Please allow microphone access to proceed with the interview',
    VIDEO_INIT: 'Failed to initialize video session',
    FACE_DETECTION: 'Face detection is required during the interview',
    NETWORK: 'Please check your internet connection'
};

window.CONFIG = CONFIG;
window.INTERVIEW_STATES = INTERVIEW_STATES;
window.ERROR_MESSAGES = ERROR_MESSAGES;
