window.videoService = {
    callFrame: null,
    callbacks: {},
    retryAttempts: 3,
    retryDelay: 1000,

    async initialize(containerId, roomUrl, token, callbacks = {}) {
        if (!window.DailyIframe) {
            throw new Error('Daily.co SDK not loaded');
        }

        if (!roomUrl || !token) {
            throw new Error('Missing room URL or authentication token');
        }

        try {
            this.callbacks = callbacks;
            const container = document.getElementById(containerId);
            
            if (!container) {
                throw new Error('Video container not found');
            }

            this.callFrame = window.DailyIframe.createFrame(container, {
                showLeaveButton: true,
                iframeStyle: {
                    width: '100%',
                    height: '100%',
                    border: '0',
                    borderRadius: '12px'
                }
            });

            this._addEventListeners();

            let attempts = 0;
            while (attempts < this.retryAttempts) {
                try {
                    await this.callFrame.join({
                        url: roomUrl,
                        token: token
                    });
                    console.log('Successfully joined video room');
                    return true;
                } catch (error) {
                    attempts++;
                    console.error(`Join attempt ${attempts} failed:`, error);
                    if (attempts === this.retryAttempts) throw error;
                    await this.sleep(this.retryDelay * attempts);
                }
            }
        } catch (error) {
            console.error('Video initialization failed:', error);
            throw error;
        }
    },

    _addEventListeners() {
        this.callFrame
            .on('joined-meeting', (event) => {
                if (this.callbacks.onJoined) this.callbacks.onJoined(event);
            })
            .on('participant-joined', (event) => {
                if (this.callbacks.onParticipantJoined) this.callbacks.onParticipantJoined(event);
            })
            .on('participant-left', (event) => {
                if (this.callbacks.onParticipantLeft) this.callbacks.onParticipantLeft(event);
            })
            .on('error', (event) => {
                if (this.callbacks.onError) this.callbacks.onError(event);
            })
            .on('camera-error', (event) => {
                if (this.callbacks.onDeviceError) {
                    this.callbacks.onDeviceError({ ...event, type: 'camera-error' });
                }
            })
            .on('microphone-error', (event) => {
                if (this.callbacks.onDeviceError) {
                    this.callbacks.onDeviceError({ ...event, type: 'microphone-error' });
                }
            });
    },

    async setCamera(enabled) {
        if (this.callFrame) {
            await this.callFrame.setLocalVideo(enabled);
        }
    },

    async setMicrophone(enabled) {
        if (this.callFrame) {
            await this.callFrame.setLocalAudio(enabled);
        }
    },

    async cleanup() {
        if (this.callFrame) {
            await this.callFrame.destroy();
            this.callFrame = null;
        }
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
