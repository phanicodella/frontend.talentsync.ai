const { createApp } = Vue;

createApp({
    data() {
        return {
            isLoggedIn: false,
            email: '',
            name: '',
            token: null,
            currentQuestion: null,
            questions: [],
            currentQuestionIndex: 0,
            isAnswering: false,
            transcription: '',
            interimTranscript: '',
            finalTranscript: '',
            faceDetected: false,
            interviewStarted: false,
            feedback: {},
            video: null,
            stream: null,
            timeLeft: 0,
            timer: null,
            answers: [],
            interviewStats: {
                totalDuration: 0,
                averageWordCount: 0,
                faceDetectionScore: 0,
            },
            currentInterviewId: null,
            roomUrl: null,
            showResults: false,
            interviewResults: null,
            apiError: null,
            faceDetectionInitialized: false,
            speechRecognitionInitialized: false,
        };
    },

    computed: {
        progress() {
            return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        },
    },

    methods: {
        async login() {
            try {
                if (!this.email || !this.name) {
                    alert('Please provide your email and password.');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.name }),
                });

                if (!response.ok) {
                    throw new Error('Login failed. Check your credentials.');
                }

                const data = await response.json();
                this.token = data.token;
                localStorage.setItem('token', this.token);
                this.isLoggedIn = true;
                alert('Login successful!');
            } catch (error) {
                console.error('Login error:', error);
                alert('Failed to log in. Please try again.');
            }
        },

        async startInterview() {
            try {
                const response = await fetch('http://localhost:5000/api/interviews/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: JSON.stringify({ email: this.email, name: this.name }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create interview session.');
                }

                const session = await response.json();
                this.currentInterviewId = session._id;
                this.roomUrl = session.roomUrl;
                this.interviewStarted = true;

                await this.initializeServices();
                this.loadQuestions();
            } catch (error) {
                console.error('Error starting interview:', error);
                alert('Failed to initialize the interview session.');
            }
        },

        async initializeServices() {
            await this.initializeCamera();
            await this.initializeFaceDetection();
            await this.initializeSpeechRecognition();
        },

        async initializeCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                this.stream = stream;
                this.video = document.getElementById('video');

                if (this.video) {
                    this.video.srcObject = stream;
                    await this.video.play();
                } else {
                    throw new Error('Video element not found.');
                }
            } catch (error) {
                console.error('Camera initialization failed:', error);
                alert('Ensure your camera is accessible and permissions are granted.');
            }
        },

        async initializeFaceDetection() {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
                await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');

                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(
                        this.video,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    this.faceDetected = detections.length > 0;
                }, 1000);
            } catch (error) {
                console.error('Face detection initialization failed:', error);
            }
        },

        async initializeSpeechRecognition() {
            try {
                const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
                if (!SpeechRecognition) {
                    throw new Error('Speech recognition not supported in this browser.');
                }

                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event) => {
                    let interim = '';
                    let final = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            final += result[0].transcript;
                        } else {
                            interim += result[0].transcript;
                        }
                    }

                    this.interimTranscript = interim;
                    this.finalTranscript = final.trim();
                    this.transcription = final.trim();
                };

                recognition.onerror = (event) => console.error('Speech recognition error:', event.error);

                this.speechRecognitionService = recognition;
            } catch (error) {
                console.error('Speech recognition initialization failed:', error);
            }
        },

        loadQuestions() {
            // Assuming questions are statically available in a global variable or API
            this.questions = window.interviewQuestions || [];
            this.currentQuestion = this.questions[0];
        },

        startAnswering() {
            this.isAnswering = true;
            this.transcription = '';
            this.interimTranscript = '';
            this.speechRecognitionService.start();
        },

        stopAnswering() {
            this.isAnswering = false;
            this.speechRecognitionService.stop();
            this.submitAnswer();
        },

        async submitAnswer() {
            try {
                const answer = {
                    question: this.currentQuestion.question,
                    answer: this.transcription || 'No answer provided',
                };

                const response = await fetch(`http://localhost:5000/api/interviews/answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: JSON.stringify(answer),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit the answer.');
                }

                const analysis = await response.json();
                this.answers.push({
                    ...answer,
                    analysis,
                });
            } catch (error) {
                console.error('Answer submission failed:', error);
                alert('Error submitting answer. Try again.');
            }
        },

        endInterview() {
            this.isLoggedIn = false;
            this.interviewStarted = false;
            alert('Interview completed successfully!');
        },
    },

    mounted() {
        console.log('App mounted and ready.');
    },

    beforeUnmount() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
    },
}).mount('#app');
