window.speechRecognitionService = {
    recognition: null,
    isListening: false,
    callback: null,
    restartTimeout: null,

    async initialize(callback) {
        try {
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!window.SpeechRecognition) {
                throw new Error('Speech Recognition not supported in this browser');
            }

            this.recognition = new window.SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.callback = callback;
            this._setupEventListeners();

            return true;
        } catch (error) {
            console.error('Speech recognition initialization failed:', error);
            throw error;
        }
    },

    _setupEventListeners() {
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isListening) {
                this._restartRecognition();
            }
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
                        confidence: event.results[0][0].confidence
                    });
                }
                if (interimTranscript) {
                    this.callback({ interim: interimTranscript.trim() });
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                this.isListening = false;
                throw new Error('Microphone access denied');
            }
        };
    },

    _restartRecognition() {
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
        }

        this.restartTimeout = setTimeout(() => {
            if (this.isListening) {
                this.recognition.start();
            }
        }, 1000);
    },

    start() {
        if (!this.isListening) {
            this.isListening = true;
            this.recognition.start();
        }
    },

    stop() {
        if (this.isListening) {
            this.isListening = false;
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            this.recognition.stop();
        }
    }
};
