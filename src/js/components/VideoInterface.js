const VideoInterface = {
    props: {
        roomUrl: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            isInitialized: false,
            hasError: false,
            errorMessage: '',
            isCameraEnabled: true,
            isMicrophoneEnabled: true,
            participantCount: 0,
            networkQuality: 100,
            deviceStatus: {
                camera: true,
                microphone: true
            }
        };
    },

    async mounted() {
        try {
            await this.initializeVideo();
        } catch (error) {
            this.handleError(error);
        }
    },

    methods: {
        async initializeVideo() {
            try {
                await window.videoService.initialize(
                    'video-container',
                    this.roomUrl,
                    this.token,
                    {
                        onJoined: this.handleJoined,
                        onParticipantJoined: this.handleParticipantJoined,
                        onParticipantLeft: this.handleParticipantLeft,
                        onError: this.handleError,
                        onNetworkQualityChange: this.handleNetworkQuality,
                        onCameraError: this.handleCameraError,
                        onMicrophoneError: this.handleMicrophoneError
                    }
                );
                this.isInitialized = true;
            } catch (error) {
                this.handleError(error);
            }
        },

        async toggleCamera() {
            try {
                this.isCameraEnabled = !this.isCameraEnabled;
                await window.videoService.setCamera(this.isCameraEnabled);
            } catch (error) {
                this.handleError(error);
                this.isCameraEnabled = !this.isCameraEnabled;
            }
        },

        async toggleMicrophone() {
            try {
                this.isMicrophoneEnabled = !this.isMicrophoneEnabled;
                await window.videoService.setMicrophone(this.isMicrophoneEnabled);
            } catch (error) {
                this.handleError(error);
                this.isMicrophoneEnabled = !this.isMicrophoneEnabled;
            }
        },

        handleJoined() {
            this.$emit('session-started');
        },

        handleParticipantJoined(event) {
            this.participantCount++;
            this.$emit('participant-joined', event);
        },

        handleParticipantLeft(event) {
            this.participantCount = Math.max(0, this.participantCount - 1);
            this.$emit('participant-left', event);
        },

        handleNetworkQuality(quality) {
            this.networkQuality = quality;
        },

        handleCameraError() {
            this.deviceStatus.camera = false;
            this.handleError(new Error('Camera access failed'));
        },

        handleMicrophoneError() {
            this.deviceStatus.microphone = false;
            this.handleError(new Error('Microphone access failed'));
        },

        handleError(error) {
            this.hasError = true;
            this.errorMessage = error.message;
            this.$emit('error', error);
        }
    },

    beforeUnmount() {
        window.videoService.cleanup();
    },

    template: `
        <div class="video-interface">
            <div id="video-container" class="video-container"></div>
            
            <div v-if="hasError" class="error-message alert alert-danger">
                {{ errorMessage }}
            </div>

            <div class="controls">
                <button 
                    @click="toggleCamera"
                    :class="['btn', isCameraEnabled ? 'btn-primary' : 'btn-secondary']"
                    :disabled="!deviceStatus.camera">
                    <i :class="['bi', isCameraEnabled ? 'bi-camera-video' : 'bi-camera-video-off']"></i>
                    Camera
                </button>

                <button 
                    @click="toggleMicrophone"
                    :class="['btn', isMicrophoneEnabled ? 'btn-primary' : 'btn-secondary']"
                    :disabled="!deviceStatus.microphone">
                    <i :class="['bi', isMicrophoneEnabled ? 'bi-mic' : 'bi-mic-mute']"></i>
                    Microphone
                </button>

                <div class="network-quality" v-if="isInitialized">
                    <i class="bi bi-wifi"></i>
                    {{ networkQuality }}%
                </div>
            </div>
        </div>
    `
};

window.VideoInterface = VideoInterface;