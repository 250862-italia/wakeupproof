// Camera Handler per WakeUpProof PWA
// Gestisce camera, foto e QR scanning

class CameraHandler {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.isActive = false;
        this.currentChallenge = null;
        
        this.init();
    }

    async init() {
        this.video = document.getElementById('camera-video');
        this.canvas = document.getElementById('camera-canvas');
        
        if (this.canvas) {
            this.context = this.canvas.getContext('2d');
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Capture button
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.capturePhoto());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryCapture());
        }

        // QR scan button
        const scanQrBtn = document.getElementById('scan-qr-btn');
        if (scanQrBtn) {
            scanQrBtn.addEventListener('click', () => this.startQRScanner());
        }
    }

    async startCamera() {
        try {
            console.log('Starting camera...');
            
            // Richiedi permessi camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Camera posteriore
                },
                audio: false
            });

            this.stream = stream;
            this.isActive = true;

            if (this.video) {
                this.video.srcObject = stream;
                this.video.play();
            }

            console.log('Camera started successfully');
            return true;

        } catch (error) {
            console.error('Error starting camera:', error);
            this.showCameraError(error);
            return false;
        }
    }

    async stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.isActive = false;

        if (this.video) {
            this.video.srcObject = null;
        }

        console.log('Camera stopped');
    }

    async capturePhoto() {
        if (!this.isActive || !this.video || !this.canvas || !this.context) {
            console.error('Camera not ready for capture');
            return null;
        }

        try {
            // Imposta dimensioni canvas
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            // Disegna frame corrente su canvas
            this.context.drawImage(this.video, 0, 0);

            // Converti in blob
            const blob = await new Promise(resolve => {
                this.canvas.toBlob(resolve, 'image/jpeg', 0.8);
            });

            // Converti in base64 per processing
            const base64 = await this.blobToBase64(blob);

            console.log('Photo captured successfully');

            // Processa foto se c'è un challenge attivo
            if (this.currentChallenge) {
                await this.processCapturedPhoto(base64);
            }

            return {
                blob: blob,
                base64: base64,
                width: this.canvas.width,
                height: this.canvas.height
            };

        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showCaptureError(error);
            return null;
        }
    }

    async processCapturedPhoto(imageData) {
        if (!this.currentChallenge) return;

        try {
            console.log('Processing captured photo for challenge:', this.currentChallenge.id);

            // Notifica challenge engine
            if (window.challengeEngine) {
                const success = await window.challengeEngine.processPhotoChallenge(
                    this.currentChallenge.id, 
                    imageData
                );

                if (success) {
                    this.showSuccessMessage('Foto verificata con successo!');
                    this.hideCameraSection();
                } else {
                    this.showErrorMessage('Foto non valida. Riprova!');
                    this.showRetryButton();
                }
            }

        } catch (error) {
            console.error('Error processing photo:', error);
            this.showErrorMessage('Errore elaborazione foto');
        }
    }

    async startQRScanner() {
        try {
            console.log('Starting QR scanner...');

            // Avvia camera se non attiva
            if (!this.isActive) {
                const cameraStarted = await this.startCamera();
                if (!cameraStarted) {
                    throw new Error('Failed to start camera');
                }
            }

            // Mostra sezione QR
            const nfcQrSection = document.getElementById('nfc-qr-section');
            if (nfcQrSection) {
                nfcQrSection.style.display = 'block';
            }

            // Avvia scanning QR
            this.startQRDetection();

            console.log('QR scanner started');

        } catch (error) {
            console.error('Error starting QR scanner:', error);
            this.showQRScannerError(error);
        }
    }

    startQRDetection() {
        // Mock QR detection - in produzione useresti una libreria come jsQR
        console.log('QR detection started');

        // Simula rilevamento QR dopo 3 secondi
        setTimeout(() => {
            this.simulateQRDetection();
        }, 3000);
    }

    simulateQRDetection() {
        // Simula rilevamento QR code
        const mockQRData = 'wakeup-proof-bathroom-123';
        
        console.log('QR Code detected:', mockQRData);
        
        // Notifica challenge engine
        if (window.challengeEngine && this.currentChallenge) {
            // Simula successo
            this.showSuccessMessage('QR Code scansionato con successo!');
            this.hideQRSection();
        }
    }

    async retryCapture() {
        console.log('Retrying capture...');
        
        // Nascondi retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.style.display = 'none';
        }

        // Mostra capture button
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.style.display = 'inline-block';
        }
    }

    // Utility functions
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    showCameraSection() {
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'block';
        }
    }

    hideCameraSection() {
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'none';
        }
        
        // Ferma camera
        this.stopCamera();
    }

    hideQRSection() {
        const nfcQrSection = document.getElementById('nfc-qr-section');
        if (nfcQrSection) {
            nfcQrSection.style.display = 'none';
        }
        
        // Ferma camera
        this.stopCamera();
    }

    showRetryButton() {
        const retryBtn = document.getElementById('retry-btn');
        const captureBtn = document.getElementById('capture-btn');
        
        if (retryBtn) {
            retryBtn.style.display = 'inline-block';
        }
        if (captureBtn) {
            captureBtn.style.display = 'none';
        }
    }

    // Error handling
    showCameraError(error) {
        let message = 'Errore camera';
        
        if (error.name === 'NotAllowedError') {
            message = 'Permessi camera negati. Abilita l\'accesso alla camera nelle impostazioni.';
        } else if (error.name === 'NotFoundError') {
            message = 'Camera non trovata. Assicurati che la camera sia collegata.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera non accessibile. Potrebbe essere utilizzata da un\'altra applicazione.';
        }

        this.showErrorMessage(message);
    }

    showCaptureError(error) {
        this.showErrorMessage('Errore durante la cattura della foto. Riprova.');
    }

    showQRScannerError(error) {
        this.showErrorMessage('Errore durante l\'avvio dello scanner QR. Riprova.');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notifications.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // API pubblica
    setCurrentChallenge(challenge) {
        this.currentChallenge = challenge;
    }

    clearCurrentChallenge() {
        this.currentChallenge = null;
    }

    async cleanup() {
        await this.stopCamera();
        this.clearCurrentChallenge();
    }
}

// Singleton instance
const cameraHandler = new CameraHandler();

// Export for use in other modules
window.CameraHandler = CameraHandler;
window.cameraHandler = cameraHandler;
