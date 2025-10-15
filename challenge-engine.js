// Challenge Engine per WakeUpProof PWA
// Gestisce tutti i tipi di challenge: foto, passi, NFC, QR

class ChallengeEngine {
    constructor() {
        this.activeChallenges = new Map();
        this.challengeTimeouts = new Map();
        this.photoTemplates = new Map();
        this.nfcKeys = new Map();
        this.qrKeys = new Map();
        
        this.init();
    }

    async init() {
        // Carica template foto esistenti
        await this.loadPhotoTemplates();
        
        // Carica chiavi NFC/QR
        await this.loadNFCKeys();
        await this.loadQRKeys();
        
        console.log('Challenge Engine initialized');
    }

    async loadPhotoTemplates() {
        try {
            // Carica template dal database
            // Per ora mock data
            this.photoTemplates.set('default', {
                vector: new Float32Array(512), // Mock embedding vector
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error loading photo templates:', error);
        }
    }

    async loadNFCKeys() {
        try {
            // Carica chiavi NFC dal database
            // Per ora mock data
            this.nfcKeys.set('bathroom', {
                uid: 'mock-nfc-uid-123',
                key: 'mock-nfc-key-456'
            });
        } catch (error) {
            console.error('Error loading NFC keys:', error);
        }
    }

    async loadQRKeys() {
        try {
            // Carica chiavi QR dal database
            // Per ora mock data
            this.qrKeys.set('bathroom', {
                data: 'wakeup-proof-bathroom-123',
                signature: 'mock-qr-signature-456'
            });
        } catch (error) {
            console.error('Error loading QR keys:', error);
        }
    }

    // PHOTO CHALLENGE
    async startPhotoChallenge(challengeId, params = {}) {
        console.log('Starting photo challenge:', challengeId);
        
        const challenge = {
            id: challengeId,
            type: 'photo',
            params: {
                minSimilarity: params.minSimilarity || 0.8,
                requireHand: params.requireHand || true,
                timeout: params.timeout || 60000, // 1 minuto
                ...params
            },
            startTime: Date.now(),
            status: 'active'
        };

        this.activeChallenges.set(challengeId, challenge);

        // Avvia timeout
        const timeout = setTimeout(() => {
            this.failChallenge(challengeId, 'Timeout');
        }, challenge.params.timeout);

        this.challengeTimeouts.set(challengeId, timeout);

        // Mostra UI camera
        this.showPhotoChallengeUI(challenge);

        return challenge;
    }

    showPhotoChallengeUI(challenge) {
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'block';
        }

        // Aggiorna UI
        const challengeElement = document.getElementById(`challenge-${challenge.id}`);
        if (challengeElement) {
            const statusElement = challengeElement.querySelector('.challenge-status');
            statusElement.textContent = 'Attivo - Scatta foto';
            statusElement.className = 'challenge-status active';
        }
    }

    async processPhotoChallenge(challengeId, imageData) {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return false;

        try {
            // Genera embedding dell'immagine
            const embedding = await this.generateImageEmbedding(imageData);
            
            // Confronta con template
            const similarity = await this.compareWithTemplate(embedding, challenge.params.minSimilarity);
            
            // Verifica presenza mano (liveness detection)
            const hasHand = challenge.params.requireHand ? await this.detectHand(imageData) : true;
            
            if (similarity >= challenge.params.minSimilarity && hasHand) {
                await this.completeChallenge(challengeId, true);
                return true;
            } else {
                await this.failChallenge(challengeId, 'Foto non valida');
                return false;
            }
        } catch (error) {
            console.error('Error processing photo challenge:', error);
            await this.failChallenge(challengeId, 'Errore elaborazione');
            return false;
        }
    }

    async generateImageEmbedding(imageData) {
        // Mock implementation - in produzione useresti MobileCLIP ONNX
        // Per ora genera un embedding casuale
        const embedding = new Float32Array(512);
        for (let i = 0; i < 512; i++) {
            embedding[i] = Math.random() * 2 - 1;
        }
        return embedding;
    }

    async compareWithTemplate(embedding, minSimilarity) {
        // Mock implementation - confronta con template salvato
        const template = this.photoTemplates.get('default');
        if (!template) return 0;

        // Calcola cosine similarity
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < embedding.length; i++) {
            dotProduct += embedding[i] * template.vector[i];
            normA += embedding[i] * embedding[i];
            normB += template.vector[i] * template.vector[i];
        }

        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0, similarity);
    }

    async detectHand(imageData) {
        // Mock implementation - in produzione useresti ML model per hand detection
        // Per ora ritorna sempre true
        return true;
    }

    // STEPS CHALLENGE
    async startStepsChallenge(challengeId, params = {}) {
        console.log('Starting steps challenge:', challengeId);
        
        const challenge = {
            id: challengeId,
            type: 'steps',
            params: {
                minSteps: params.minSteps || 120,
                timeLimit: params.timeLimit || 120000, // 2 minuti
                timeout: params.timeout || 180000, // 3 minuti totali
                ...params
            },
            startTime: Date.now(),
            status: 'active',
            currentSteps: 0
        };

        this.activeChallenges.set(challengeId, challenge);

        // Avvia timeout
        const timeout = setTimeout(() => {
            this.failChallenge(challengeId, 'Timeout');
        }, challenge.params.timeout);

        this.challengeTimeouts.set(challengeId, timeout);

        // Mostra UI passi
        this.showStepsChallengeUI(challenge);

        // Avvia contapassi
        await this.startStepCounting(challengeId);

        return challenge;
    }

    showStepsChallengeUI(challenge) {
        const stepsSection = document.getElementById('steps-section');
        if (stepsSection) {
            stepsSection.style.display = 'block';
        }

        // Aggiorna UI
        const challengeElement = document.getElementById(`challenge-${challenge.id}`);
        if (challengeElement) {
            const statusElement = challengeElement.querySelector('.challenge-status');
            statusElement.textContent = 'Attivo - Cammina!';
            statusElement.className = 'challenge-status active';
        }

        // Aggiorna progress bar
        this.updateStepsProgress(challenge.id, 0);
    }

    async startStepCounting(challengeId) {
        // Usa accelerometro per contare passi
        if ('DeviceMotionEvent' in window) {
            let stepCount = 0;
            let lastAcceleration = null;
            const threshold = 0.5; // Soglia per rilevare passo

            const handleMotion = (event) => {
                const acceleration = event.acceleration;
                if (lastAcceleration) {
                    const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
                    const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
                    const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
                    
                    const totalDelta = deltaX + deltaY + deltaZ;
                    
                    if (totalDelta > threshold) {
                        stepCount++;
                        this.updateStepsProgress(challengeId, stepCount);
                        
                        // Controlla se obiettivo raggiunto
                        const challenge = this.activeChallenges.get(challengeId);
                        if (challenge && stepCount >= challenge.params.minSteps) {
                            this.completeChallenge(challengeId, true);
                        }
                    }
                }
                lastAcceleration = acceleration;
            };

            window.addEventListener('devicemotion', handleMotion);
            
            // Salva handler per cleanup
            this.activeChallenges.get(challengeId).motionHandler = handleMotion;
        } else {
            console.warn('DeviceMotionEvent not supported');
            // Fallback: simula passi
            this.simulateSteps(challengeId);
        }
    }

    simulateSteps(challengeId) {
        // Simula passi per testing
        let stepCount = 0;
        const interval = setInterval(() => {
            stepCount += Math.floor(Math.random() * 3) + 1;
            this.updateStepsProgress(challengeId, stepCount);
            
            const challenge = this.activeChallenges.get(challengeId);
            if (challenge && stepCount >= challenge.params.minSteps) {
                clearInterval(interval);
                this.completeChallenge(challengeId, true);
            }
        }, 1000);
    }

    updateStepsProgress(challengeId, steps) {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        challenge.currentSteps = steps;
        
        // Aggiorna UI
        const stepsCountElement = document.getElementById('steps-count');
        const progressElement = document.getElementById('steps-progress');
        
        if (stepsCountElement) {
            stepsCountElement.textContent = steps;
        }
        
        if (progressElement) {
            const progress = Math.min((steps / challenge.params.minSteps) * 100, 100);
            progressElement.style.width = `${progress}%`;
        }
    }

    // NFC CHALLENGE
    async startNFCChallenge(challengeId, params = {}) {
        console.log('Starting NFC challenge:', challengeId);
        
        const challenge = {
            id: challengeId,
            type: 'nfc',
            params: {
                expectedUID: params.expectedUID || 'mock-nfc-uid-123',
                timeout: params.timeout || 60000,
                ...params
            },
            startTime: Date.now(),
            status: 'active'
        };

        this.activeChallenges.set(challengeId, challenge);

        // Avvia timeout
        const timeout = setTimeout(() => {
            this.failChallenge(challengeId, 'Timeout');
        }, challenge.params.timeout);

        this.challengeTimeouts.set(challengeId, timeout);

        // Mostra UI NFC
        this.showNFCChallengeUI(challenge);

        // Avvia scanning NFC
        await this.startNFCScanning(challengeId);

        return challenge;
    }

    showNFCChallengeUI(challenge) {
        const nfcQrSection = document.getElementById('nfc-qr-section');
        if (nfcQrSection) {
            nfcQrSection.style.display = 'block';
        }

        // Aggiorna UI
        const challengeElement = document.getElementById(`challenge-${challenge.id}`);
        if (challengeElement) {
            const statusElement = challengeElement.querySelector('.challenge-status');
            statusElement.textContent = 'Attivo - Avvicina NFC';
            statusElement.className = 'challenge-status active';
        }
    }

    async startNFCScanning(challengeId) {
        // Mock implementation - in produzione useresti Web NFC API
        console.log('NFC scanning started for challenge:', challengeId);
        
        // Simula scanning NFC
        setTimeout(() => {
            this.simulateNFCDetection(challengeId);
        }, 2000);
    }

    simulateNFCDetection(challengeId) {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        // Simula rilevamento NFC
        const detectedUID = 'mock-nfc-uid-123';
        
        if (detectedUID === challenge.params.expectedUID) {
            this.completeChallenge(challengeId, true);
        } else {
            this.failChallenge(challengeId, 'UID NFC non valido');
        }
    }

    // QR CHALLENGE
    async startQRChallenge(challengeId, params = {}) {
        console.log('Starting QR challenge:', challengeId);
        
        const challenge = {
            id: challengeId,
            type: 'qr',
            params: {
                expectedData: params.expectedData || 'wakeup-proof-bathroom-123',
                timeout: params.timeout || 60000,
                ...params
            },
            startTime: Date.now(),
            status: 'active'
        };

        this.activeChallenges.set(challengeId, challenge);

        // Avvia timeout
        const timeout = setTimeout(() => {
            this.failChallenge(challengeId, 'Timeout');
        }, challenge.params.timeout);

        this.challengeTimeouts.set(challengeId, timeout);

        // Mostra UI QR
        this.showQRChallengeUI(challenge);

        // Avvia scanner QR
        await this.startQRScanning(challengeId);

        return challenge;
    }

    showQRChallengeUI(challenge) {
        const nfcQrSection = document.getElementById('nfc-qr-section');
        if (nfcQrSection) {
            nfcQrSection.style.display = 'block';
        }

        // Aggiorna UI
        const challengeElement = document.getElementById(`challenge-${challenge.id}`);
        if (challengeElement) {
            const statusElement = challengeElement.querySelector('.challenge-status');
            statusElement.textContent = 'Attivo - Scansiona QR';
            statusElement.className = 'challenge-status active';
        }
    }

    async startQRScanning(challengeId) {
        // Mock implementation - in produzione useresti QR scanner library
        console.log('QR scanning started for challenge:', challengeId);
        
        // Simula scanning QR
        setTimeout(() => {
            this.simulateQRDetection(challengeId);
        }, 3000);
    }

    simulateQRDetection(challengeId) {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        // Simula rilevamento QR
        const detectedData = 'wakeup-proof-bathroom-123';
        
        if (detectedData === challenge.params.expectedData) {
            this.completeChallenge(challengeId, true);
        } else {
            this.failChallenge(challengeId, 'QR Code non valido');
        }
    }

    // CHALLENGE MANAGEMENT
    async completeChallenge(challengeId, success = true) {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        console.log('Challenge completed:', challengeId, success);

        // Pulisci timeout
        if (this.challengeTimeouts.has(challengeId)) {
            clearTimeout(this.challengeTimeouts.get(challengeId));
            this.challengeTimeouts.delete(challengeId);
        }

        // Pulisci event listeners
        if (challenge.motionHandler) {
            window.removeEventListener('devicemotion', challenge.motionHandler);
        }

        // Aggiorna stato
        challenge.status = success ? 'completed' : 'failed';
        challenge.endTime = Date.now();

        // Aggiorna UI
        this.updateChallengeUI(challengeId, success);

        // Rimuovi da active challenges
        this.activeChallenges.delete(challengeId);

        // Notifica completamento
        if (success) {
            this.showSuccessNotification(challenge);
        } else {
            this.showFailureNotification(challenge);
        }

        // Notifica alarm engine
        if (window.alarmEngine) {
            await window.alarmEngine.completeChallenge(challengeId, success);
        }
    }

    async failChallenge(challengeId, reason) {
        console.log('Challenge failed:', challengeId, reason);
        await this.completeChallenge(challengeId, false);
    }

    updateChallengeUI(challengeId, success) {
        const challengeElement = document.getElementById(`challenge-${challengeId}`);
        if (!challengeElement) return;

        const statusElement = challengeElement.querySelector('.challenge-status');
        if (statusElement) {
            statusElement.textContent = success ? 'Completato' : 'Fallito';
            statusElement.className = `challenge-status ${success ? 'completed' : 'error'}`;
        }
    }

    showSuccessNotification(challenge) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Challenge Completato!', {
                body: `Challenge ${challenge.type} completato con successo`,
                icon: '/icons/icon-192x192.png'
            });
        }
    }

    showFailureNotification(challenge) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Challenge Fallito', {
                body: `Challenge ${challenge.type} fallito. Riprova!`,
                icon: '/icons/icon-192x192.png'
            });
        }
    }

    // API pubblica
    async createChallenge(alarmId, type, params = {}) {
        const challengeId = this.generateId();
        
        const challenge = {
            id: challengeId,
            alarmId: alarmId,
            type: type,
            params: params,
            enabled: true,
            createdAt: new Date().toISOString()
        };

        // Salva nel database
        await database.createChallenge(challenge);

        return challenge;
    }

    generateId() {
        return 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Cleanup
    cleanup() {
        // Pulisci tutti i timeout
        this.challengeTimeouts.forEach(timeout => clearTimeout(timeout));
        this.challengeTimeouts.clear();

        // Pulisci event listeners
        this.activeChallenges.forEach(challenge => {
            if (challenge.motionHandler) {
                window.removeEventListener('devicemotion', challenge.motionHandler);
            }
        });

        this.activeChallenges.clear();
    }
}

// Singleton instance
const challengeEngine = new ChallengeEngine();

// Export for use in other modules
window.ChallengeEngine = ChallengeEngine;
window.challengeEngine = challengeEngine;
