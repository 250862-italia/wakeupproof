// Sensors Handler per WakeUpProof PWA
// Gestisce sensori: accelerometro, giroscopio, passi

class SensorsHandler {
    constructor() {
        this.isActive = false;
        this.stepCount = 0;
        this.lastAcceleration = null;
        this.motionHandler = null;
        this.stepThreshold = 0.5;
        this.currentChallenge = null;
        
        this.init();
    }

    async init() {
        console.log('Sensors Handler initialized');
        
        // Controlla supporto sensori
        this.checkSensorSupport();
    }

    checkSensorSupport() {
        const support = {
            deviceMotion: 'DeviceMotionEvent' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            permissions: 'permissions' in navigator
        };

        console.log('Sensor support:', support);
        return support;
    }

    async requestPermissions() {
        if ('permissions' in navigator) {
            try {
                const motionPermission = await navigator.permissions.query({ name: 'accelerometer' });
                const orientationPermission = await navigator.permissions.query({ name: 'gyroscope' });
                
                console.log('Motion permission:', motionPermission.state);
                console.log('Orientation permission:', orientationPermission.state);
                
                return {
                    motion: motionPermission.state === 'granted',
                    orientation: orientationPermission.state === 'granted'
                };
            } catch (error) {
                console.warn('Permission query failed:', error);
                return { motion: false, orientation: false };
            }
        }
        
        return { motion: true, orientation: true }; // Fallback per browser senza permission API
    }

    async startStepsChallenge(challengeId) {
        console.log('Starting steps challenge:', challengeId);
        
        this.currentChallenge = challengeId;
        this.stepCount = 0;
        this.isActive = true;

        // Richiedi permessi
        const permissions = await this.requestPermissions();
        
        if (!permissions.motion) {
            console.warn('Motion permission not granted, using fallback');
            this.startFallbackStepsChallenge();
            return;
        }

        // Avvia rilevamento passi
        this.startStepDetection();
        
        // Mostra UI
        this.showStepsUI();
    }

    startStepDetection() {
        if (!('DeviceMotionEvent' in window)) {
            console.warn('DeviceMotionEvent not supported');
            this.startFallbackStepsChallenge();
            return;
        }

        let lastTime = Date.now();
        let stepDetected = false;

        this.motionHandler = (event) => {
            const now = Date.now();
            const timeDelta = now - lastTime;
            
            // Evita troppi calcoli
            if (timeDelta < 100) return;
            
            const acceleration = event.acceleration;
            if (!acceleration) return;

            // Calcola magnitudine accelerazione
            const magnitude = Math.sqrt(
                acceleration.x * acceleration.x +
                acceleration.y * acceleration.y +
                acceleration.z * acceleration.z
            );

            // Rileva picco di accelerazione (passo)
            if (this.lastAcceleration !== null) {
                const delta = Math.abs(magnitude - this.lastAcceleration);
                
                if (delta > this.stepThreshold && !stepDetected) {
                    this.stepCount++;
                    stepDetected = true;
                    
                    console.log('Step detected:', this.stepCount);
                    
                    // Aggiorna UI
                    this.updateStepsUI();
                    
                    // Controlla se obiettivo raggiunto
                    this.checkStepsGoal();
                    
                    // Reset detection flag dopo 200ms
                    setTimeout(() => {
                        stepDetected = false;
                    }, 200);
                }
            }
            
            this.lastAcceleration = magnitude;
            lastTime = now;
        };

        // Aggiungi event listener
        window.addEventListener('devicemotion', this.motionHandler, true);
        
        console.log('Step detection started');
    }

    startFallbackStepsChallenge() {
        console.log('Starting fallback steps challenge (simulation)');
        
        // Simula passi per testing
        const interval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(interval);
                return;
            }
            
            // Simula 1-3 passi ogni secondo
            const steps = Math.floor(Math.random() * 3) + 1;
            this.stepCount += steps;
            
            console.log('Simulated steps:', this.stepCount);
            
            // Aggiorna UI
            this.updateStepsUI();
            
            // Controlla se obiettivo raggiunto
            this.checkStepsGoal();
            
        }, 1000);
    }

    updateStepsUI() {
        const stepsCountElement = document.getElementById('steps-count');
        const progressElement = document.getElementById('steps-progress');
        
        if (stepsCountElement) {
            stepsCountElement.textContent = this.stepCount;
        }
        
        if (progressElement && this.currentChallenge) {
            // Assumi 120 passi come obiettivo
            const target = 120;
            const progress = Math.min((this.stepCount / target) * 100, 100);
            progressElement.style.width = `${progress}%`;
        }
    }

    showStepsUI() {
        const stepsSection = document.getElementById('steps-section');
        if (stepsSection) {
            stepsSection.style.display = 'block';
        }

        // Aggiorna challenge status
        const challengeElement = document.getElementById(`challenge-${this.currentChallenge}`);
        if (challengeElement) {
            const statusElement = challengeElement.querySelector('.challenge-status');
            if (statusElement) {
                statusElement.textContent = 'Attivo - Cammina!';
                statusElement.className = 'challenge-status active';
            }
        }
    }

    checkStepsGoal() {
        if (!this.currentChallenge) return;
        
        const target = 120; // Passi obiettivo
        
        if (this.stepCount >= target) {
            console.log('Steps goal reached!');
            this.completeStepsChallenge();
        }
    }

    async completeStepsChallenge() {
        console.log('Steps challenge completed');
        
        // Ferma rilevamento
        this.stopStepDetection();
        
        // Aggiorna UI
        this.updateStepsUI();
        
        // Notifica challenge engine
        if (window.challengeEngine) {
            await window.challengeEngine.completeChallenge(this.currentChallenge, true);
        }
        
        // Nascondi sezione
        this.hideStepsUI();
        
        // Reset
        this.currentChallenge = null;
        this.stepCount = 0;
        this.isActive = false;
    }

    stopStepDetection() {
        if (this.motionHandler) {
            window.removeEventListener('devicemotion', this.motionHandler);
            this.motionHandler = null;
        }
        
        this.isActive = false;
        console.log('Step detection stopped');
    }

    hideStepsUI() {
        const stepsSection = document.getElementById('steps-section');
        if (stepsSection) {
            stepsSection.style.display = 'none';
        }
    }

    // API per altri sensori
    async startOrientationTracking() {
        if (!('DeviceOrientationEvent' in window)) {
            console.warn('DeviceOrientationEvent not supported');
            return false;
        }

        const orientationHandler = (event) => {
            const alpha = event.alpha; // Z-axis rotation
            const beta = event.beta;  // X-axis rotation
            const gamma = event.gamma; // Y-axis rotation
            
            // Log orientamento per debugging
            console.log('Orientation:', { alpha, beta, gamma });
        };

        window.addEventListener('deviceorientation', orientationHandler);
        
        return () => {
            window.removeEventListener('deviceorientation', orientationHandler);
        };
    }

    async getDeviceInfo() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints,
            sensors: this.checkSensorSupport()
        };

        return info;
    }

    // Utility functions
    calculateStepFrequency() {
        // Calcola frequenza passi basata su timestamp
        // Implementazione semplificata
        return this.stepCount / 60; // passi al minuto
    }

    detectActivityLevel() {
        // Rileva livello di attività basato su accelerazione
        // Implementazione semplificata
        if (this.stepCount > 100) return 'high';
        if (this.stepCount > 50) return 'medium';
        return 'low';
    }

    // Cleanup
    async cleanup() {
        this.stopStepDetection();
        this.currentChallenge = null;
        this.stepCount = 0;
        this.isActive = false;
    }

    // API pubblica
    getCurrentStepCount() {
        return this.stepCount;
    }

    isChallengeActive() {
        return this.isActive && this.currentChallenge !== null;
    }

    async reset() {
        await this.cleanup();
        this.stepCount = 0;
    }
}

// Singleton instance
const sensorsHandler = new SensorsHandler();

// Export for use in other modules
window.SensorsHandler = SensorsHandler;
window.sensorsHandler = sensorsHandler;
