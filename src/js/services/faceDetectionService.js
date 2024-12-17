window.faceDetectionService = {
    isInitialized: false,
    detectionInterval: null,
    onFaceDetectedCallback: null,

    async initialize() {
        try {
            // Wait for face-api to be loaded
            const maxAttempts = 20;
            let attempts = 0;
            while (typeof faceapi === 'undefined' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 250));
                attempts++;
            }

            if (typeof faceapi === 'undefined') {
                throw new Error('Face-api failed to load');
            }

            await Promise.all([
                faceapi.nets.tinyFaceDetector.load('/assets/models'),
                faceapi.nets.faceLandmark68Net.load('/assets/models')
            ]);

            this.isInitialized = true;
            console.log('Face detection initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize face detection:', error);
            throw error;
        }
    },

    startDetection(videoElement, onFaceDetected) {
        if (!this.isInitialized) {
            throw new Error('Face detection not initialized');
        }

        if (!videoElement) {
            throw new Error('Video element not found');
        }

        this.onFaceDetectedCallback = onFaceDetected;
        
        this.detectionInterval = setInterval(async () => {
            try {
                if (videoElement.readyState === 4) {
                    const detections = await faceapi.detectAllFaces(
                        videoElement,
                        new faceapi.TinyFaceDetectorOptions()
                    );
                    this.onFaceDetectedCallback(detections.length > 0);
                }
            } catch (error) {
                console.error('Face detection error:', error);
            }
        }, 1000);
    },

    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
};
