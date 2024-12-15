class FaceDetectionService {
    constructor() {
        this.isInitialized = false;
        this.detectionInterval = null;
        this.onFaceDetectedCallback = null;
    }

    async initialize() {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models')
            ]);
            this.isInitialized = true;
            console.log('Face detection initialized');
        } catch (error) {
            console.error('Failed to initialize face detection:', error);
            throw error;
        }
    }

    startDetection(videoElement, onFaceDetected) {
        if (!this.isInitialized) {
            throw new Error('Face detection not initialized');
        }

        this.onFaceDetectedCallback = onFaceDetected;
        
        this.detectionInterval = setInterval(async () => {
            try {
                const detections = await faceapi.detectAllFaces(
                    videoElement,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 224,
                        scoreThreshold: 0.5
                    })
                );

                // Call callback with face detection status
                this.onFaceDetectedCallback(detections.length > 0);

                // Additional analytics we can add later
                if (detections.length > 0) {
                    const detection = detections[0];
                    // You can add more analysis here:
                    // - Face position
                    // - Multiple face warning
                    // - Looking away detection
                }

            } catch (error) {
                console.error('Face detection error:', error);
            }
        }, 1000); // Check every second
    }

    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
}

// Initialize and export the service
window.faceDetectionService = new FaceDetectionService();