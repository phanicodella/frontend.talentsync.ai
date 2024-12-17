// frontend/src/js/app.js
const { createApp } = Vue;

createApp({
    data() {
        return {
            isLoggedIn: false,
            isLoading: false,
            email: '',
            name: '',
            token: null,
            currentInterviewId: null,
            roomUrl: null,
            currentQuestion: null,
            questions: window.interviewQuestions || [],
            currentQuestionIndex: 0,
            isAnswering: false,
            transcription: '',
            faceDetected: false,
            videoInitialized: false,
            videoError: null,
            remoteParticipantJoined: false,
            deviceStatus: {
                camera: true,
                microphone: true
            },
            interviewResults: null,
            showResults: false,
            timeLeft: 0,
            timer: null,
            retryAttempts: 3,
            retryDelay: 1000
        };
    },

    computed: {
        progress() {
            return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        },
        
        canProceed() {
            return this.videoInitialized && this.faceDetected;
        }
    },

    methods: {
        async startInterview() {
            this.resetInterviewState();
            this.isLoading = true;

            try {
                console.log('Starting interview process...', { email: this.email, name: this.name });
                
                this.validateInputs();
                const authResult = await this.authenticateCandidate();
                console.log('Authentication successful:', authResult);

                const interviewResponse = await this.createInterviewSession();
                console.log('Interview session creation response:', interviewResponse);

                await this.initializeServices(interviewResponse.data);
                this.setInterviewState(interviewResponse);

            } catch (error) {
                console.error('Interview Start Error', {
                    message: error.message,
                    stack: error.stack
                });
                this.videoError = error.message || 'Failed to start interview';
                this.isLoggedIn = false;
            } finally {
                this.isLoading = false;
            }
        },

        resetInterviewState() {
            console.log('Resetting interview state');
            this.videoError = null;
            this.currentInterviewId = null;
            this.roomUrl = null;
            this.videoInitialized = false;
            this.isLoggedIn = false;
            this.transcription = '';
            this.faceDetected = false;
            this.isAnswering = false;
            if (this.timer) clearInterval(this.timer);
        },

        validateInputs() {
            if (!this.email || !this.name) {
                throw new Error('Email and full name are required');
            }
            if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error('Please enter a valid email address');
            }
            if (this.name.length < 2) {
                throw new Error('Name must be at least 2 characters long');
            }
            console.log('Input validation passed');
        },

        async authenticateCandidate() {
            try {
                console.log('Authenticating candidate...');
                const authResult = await window.authService.candidateAccess(this.email, this.name);
                this.token = authResult.token;
                console.log('Authentication successful', { email: this.email });
                return authResult;
            } catch (error) {
                console.error('Authentication failed', error);
                throw new Error('Unable to authenticate. Please try again.');
            }
        },

        async createInterviewSession() {
            try {
                console.log('Creating interview session...', { email: this.email, name: this.name });
                const interviewResponse = await window.api.createInterview({ 
                    email: this.email, 
                    name: this.name 
                });

                console.log('Interview creation response:', interviewResponse);

                if (!interviewResponse.data || !interviewResponse.data.roomUrl) {
                    console.error('Invalid interview response:', interviewResponse);
                    throw new Error('Failed to create video room');
                }

                return interviewResponse;
            } catch (error) {
                console.error('Interview creation failed', error);
                throw new Error('Unable to create interview session');
            }
        },

        async initializeServices(interviewData) {
            try {
                console.log('Initializing services...');

                // Initialize video first
                await this.initializeVideoSession(interviewData.roomUrl, interviewData.token);
                console.log('Video initialized successfully');

                // Then face detection
                await this.initializeFaceDetection();
                console.log('Face detection initialized successfully');

                // Finally speech recognition
                await this.initializeSpeechRecognition();
                console.log('Speech recognition initialized successfully');

                console.log('All services initialized successfully');
            } catch (error) {
                console.error('Service initialization failed', error);
                throw new Error('Failed to initialize interview services');
            }
        },

        setInterviewState(interviewResponse) {
            console.log('Setting interview state:', interviewResponse.data);
            this.currentInterviewId = interviewResponse.data._id;
            this.roomUrl = interviewResponse.data.roomUrl;
            this.isLoggedIn = true;
            this.currentQuestion = this.questions[0];
            this.setupQuestionTimer();
        },

        async initializeVideoSession(roomUrl, token) {
            if (!roomUrl || !token) {
                throw new Error('Missing room URL or authentication token');
            }

            try {
                await window.videoService.initialize(
                    'video-container',
                    roomUrl,
                    token,
                    {
                        onJoined: this.handleVideoJoined,
                        onParticipantJoined: this.handleParticipantJoined,
                        onParticipantLeft: this.handleParticipantLeft,
                        onError: this.handleVideoError,
                        onDeviceError: this.handleDeviceError
                    }
                );
                this.videoInitialized = true;
                console.log('Video session initialized successfully');
            } catch (error) {
                console.error('Video initialization failed:', error);
                throw error;
            }
        },

        async initializeFaceDetection() {
            try {
                await window.faceDetectionService.initialize();
                const videoElement = document.querySelector('#video-container video');
                if (!videoElement) {
                    throw new Error('Video element not found');
                }

                window.faceDetectionService.startDetection(
                    videoElement, 
                    (detected) => {
                        this.faceDetected = detected;
                        console.log('Face detection status:', detected);
                    }
                );
            } catch (error) {
                console.error('Face detection initialization failed:', error);
                throw error;
            }
        },

        async initializeSpeechRecognition() {
            try {
                await window.speechRecognitionService.initialize((result) => {
                    if (result.final) {
                        this.transcription = result.final;
                    } else if (result.interim) {
                        this.transcription = `${this.transcription} ${result.interim}`;
                    }
                });
            } catch (error) {
                console.error('Speech recognition initialization failed:', error);
                throw error;
            }
        },

        setupQuestionTimer() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            this.timeLeft = this.currentQuestion.timeLimit || 120;
            this.timer = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    clearInterval(this.timer);
                    if (this.isAnswering) {
                        this.stopAnswering();
                    }
                }
            }, 1000);
        },

        async startAnswering() {
            try {
                if (!this.videoInitialized || !this.faceDetected) {
                    throw new Error('Please ensure your camera is working and face is visible');
                }

                this.isAnswering = true;
                this.transcription = '';
                await window.speechRecognitionService.start();
                console.log('Started recording answer');
            } catch (error) {
                console.error('Failed to start answering:', error);
                this.videoError = error.message;
                this.isAnswering = false;
            }
        },

        async stopAnswering() {
            try {
                if (!this.isAnswering) return;

                this.isAnswering = false;
                await window.speechRecognitionService.stop();
                console.log('Stopped recording answer');
                await this.submitAnswer();
            } catch (error) {
                console.error('Failed to stop answering:', error);
                this.videoError = error.message;
            }
        },

        async submitAnswer() {
            try {
                if (!this.transcription) {
                    throw new Error('No answer recorded');
                }

                const answerData = {
                    questionId: this.currentQuestion.id,
                    question: this.currentQuestion.question,
                    answer: this.transcription,
                    duration: this.currentQuestion.timeLimit - this.timeLeft,
                    faceDetectionScore: this.faceDetected ? 1 : 0
                };

                await window.api.submitAnswer(
                    this.currentInterviewId, 
                    answerData
                );

                console.log('Answer submitted successfully');
                this.progressToNextQuestion();
            } catch (error) {
                console.error('Answer Submission Error:', error);
                this.videoError = 'Failed to submit answer: ' + error.message;
            }
        },

        progressToNextQuestion() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.currentQuestion = this.questions[this.currentQuestionIndex];
                this.transcription = '';
                this.setupQuestionTimer();
            } else {
                this.endInterview();
            }
        },

        async endInterview() {
            try {
                console.log('Ending interview session...');
                
                // Stop all services
                await window.videoService.cleanup();
                window.faceDetectionService.stopDetection();
                window.speechRecognitionService.stop();
                
                const response = await window.api.endInterview(this.currentInterviewId);
                console.log('Interview ended successfully:', response);
                
                this.interviewResults = response.data;
                this.showResults = true;
                this.isLoggedIn = false;
            } catch (error) {
                console.error('Interview End Error:', error);
                this.videoError = 'Failed to end interview: ' + error.message;
            }
        },

        handleVideoJoined(event) {
            console.log('Video session joined:', event);
        },

        handleParticipantJoined(event) {
            console.log('Remote participant joined:', event);
            this.remoteParticipantJoined = true;
        },

        handleParticipantLeft(event) {
            console.log('Remote participant left:', event);
            this.remoteParticipantJoined = false;
        },

        handleVideoError(error) {
            console.error('Video Session Error:', error);
            this.videoError = error.message || 'Video session error occurred';
        },

        handleDeviceError(error) {
            console.error('Device Error:', error);
            const device = error.type === 'camera-error' ? 'camera' : 'microphone';
            this.deviceStatus[device] = false;
            this.videoError = `Unable to access ${device}. Please check permissions and try again.`;
        },

        async cleanup() {
            console.log('Cleaning up interview session...');
            
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }

            if (this.isLoggedIn) {
                try {
                    await this.endInterview();
                } catch (error) {
                    console.error('Cleanup error:', error);
                }
            }

            window.videoService.cleanup();
            window.faceDetectionService.stopDetection();
            window.speechRecognitionService.stop();
            
            this.resetInterviewState();
        }
    },

    mounted() {
        window.addEventListener('beforeunload', (event) => {
            if (this.isLoggedIn) {
                event.preventDefault();
                event.returnValue = 'Are you sure you want to leave? Your interview progress will be lost.';
            }
        });
    },

    beforeUnmount() {
        this.cleanup();
    }
}).mount('#app');
