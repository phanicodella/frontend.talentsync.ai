// frontend/src/js/speechRecognition.js
class SpeechRecognitionService {
    constructor() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!window.SpeechRecognition) {
            console.error('Speech Recognition is not supported in this browser');
            return;
        }

        this.recognition = null;
        this.isListening = false;
        this.callback = null;
        this.restartTimeout = null;
    }

    async initialize(callback) {
        if (!window.SpeechRecognition) {
            throw new Error('Speech Recognition is not supported in this browser');
        }

        this.callback = callback;
        await this.setupRecognition();
        return true;
    }

    async setupRecognition() {
        try {
            if (this.recognition) {
                this.recognition.onend = null;
                this.recognition.onresult = null;
                this.recognition.onerror = null;
                this.recognition.abort();
            }

            this.recognition = new window.SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.isListening = true;
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (this.callback) {
                    if (finalTranscript) {
                        this.callback({
                            final: finalTranscript.trim(),
                            confidence: event.results[event.resultIndex][0].confidence
                        });
                    }
                    if (interimTranscript) {
                        this.callback({
                            interim: interimTranscript.trim()
                        });
                    }
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (this.isListening && event.error !== 'no-speech') {
                    this.restartRecognition();
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                if (this.isListening) {
                    this.restartRecognition();
                }
            };

            return true;
        } catch (error) {
            console.error('Error setting up speech recognition:', error);
            throw error;
        }
    }

    restartRecognition() {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
        }
        
        this.restartTimeout = setTimeout(() => {
            if (this.isListening) {
                console.log('Restarting speech recognition...');
                this.setupRecognition().then(() => {
                    this.recognition.start();
                }).catch(error => {
                    console.error('Failed to restart speech recognition:', error);
                });
            }
        }, 250);
    }

    start() {
        try {
            this.isListening = true;
            this.recognition.start();
            console.log('Speech recognition started successfully');
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            this.isListening = false;
            throw error;
        }
    }

    stop() {
        this.isListening = false;
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
        if (this.recognition) {
            try {
                this.recognition.stop();
                console.log('Speech recognition stopped successfully');
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }
    }
}

window.speechRecognitionService = new SpeechRecognitionService();