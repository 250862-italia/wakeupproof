// Alarm Engine per WakeUpProof PWA
// Gestisce allarmi, notifiche e loop 30s

class AlarmEngine {
    constructor() {
        this.activeAlarms = new Map();
        this.alarmTimeouts = new Map();
        this.wakeLock = null;
        this.audioContext = null;
        this.currentAlarm = null;
        this.loopInterval = null;
        this.escalationLevel = 0;
        this.maxEscalation = 5;
        
        this.init();
    }

    async init() {
        // Richiedi permessi notifiche
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }

        // Inizializza audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio context not supported:', error);
        }

        // Carica allarmi dal database
        await this.loadAlarms();
        
        // Avvia scheduler
        this.startScheduler();
    }

    async loadAlarms() {
        try {
            const alarms = await database.getAlarms();
            alarms.forEach(alarm => {
                if (alarm.enabled) {
                    this.scheduleAlarm(alarm);
                }
            });
        } catch (error) {
            console.error('Error loading alarms:', error);
        }
    }

    startScheduler() {
        // Controlla ogni minuto se ci sono allarmi da attivare
        setInterval(() => {
            this.checkAlarms();
        }, 60000);
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        this.activeAlarms.forEach((alarm, id) => {
            const alarmTime = this.parseTime(alarm.time);
            const alarmMinutes = alarmTime.hours * 60 + alarmTime.minutes;
            
            // Controlla se è il momento dell'allarme
            if (Math.abs(currentTime - alarmMinutes) < 1 && !alarm.triggered) {
                this.triggerAlarm(alarm);
            }
        });
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return { hours, minutes };
    }

    async triggerAlarm(alarm) {
        console.log('Triggering alarm:', alarm);
        
        // Marca come attivato
        alarm.triggered = true;
        this.currentAlarm = alarm;
        
        // Attiva wake lock
        await this.acquireWakeLock();
        
        // Mostra notifica
        this.showAlarmNotification(alarm);
        
        // Avvia suono
        this.playAlarmSound();
        
        // Avvia vibrazione
        this.startVibration();
        
        // Mostra UI di allarme
        this.showAlarmUI(alarm);
        
        // Avvia loop 30s
        this.startAlarmLoop(alarm);
        
        // Aggiorna database
        await database.updateAlarm(alarm.id, { triggered: true, lastTriggered: new Date().toISOString() });
    }

    async acquireWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock acquired');
            } catch (error) {
                console.error('Wake lock failed:', error);
            }
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake lock released');
        }
    }

    showAlarmNotification(alarm) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('WakeUpProof - Sveglia Attiva!', {
                body: `È ora di svegliarsi! Completare i challenge per spegnere l'allarme.`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'wakeup-proof-alarm',
                requireInteraction: true,
                vibrate: [200, 100, 200],
                actions: [
                    {
                        action: 'complete-challenge',
                        title: 'Completa Challenge',
                        icon: '/icons/icon-72x72.png'
                    }
                ]
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    playAlarmSound() {
        if (!this.audioContext) return;

        // Crea suono allarme
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    startVibration() {
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    showAlarmUI(alarm) {
        // Mostra sezione challenge
        const challengesSection = document.getElementById('challenges-section');
        if (challengesSection) {
            challengesSection.style.display = 'block';
        }

        // Aggiorna status
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator ringing';
        }
        if (statusText) {
            statusText.textContent = 'ALARME ATTIVO - Completa i challenge!';
        }

        // Carica challenge per questo allarme
        this.loadChallengesForAlarm(alarm);
    }

    async loadChallengesForAlarm(alarm) {
        try {
            const challenges = await database.getChallengesByAlarm(alarm.id);
            this.displayChallenges(challenges);
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    }

    displayChallenges(challenges) {
        const challengesList = document.getElementById('challenges-list');
        if (!challengesList) return;

        challengesList.innerHTML = '';

        challenges.forEach(challenge => {
            const challengeElement = this.createChallengeElement(challenge);
            challengesList.appendChild(challengeElement);
        });
    }

    createChallengeElement(challenge) {
        const div = document.createElement('div');
        div.className = 'challenge-item';
        div.id = `challenge-${challenge.id}`;
        
        div.innerHTML = `
            <div class="challenge-header">
                <span class="challenge-title">${this.getChallengeTitle(challenge.type)}</span>
                <span class="challenge-status pending">In attesa</span>
            </div>
            <div class="challenge-description">${this.getChallengeDescription(challenge.type)}</div>
            <div class="challenge-actions">
                <button class="btn-primary" onclick="alarmEngine.startChallenge('${challenge.id}')">
                    Inizia Challenge
                </button>
            </div>
        `;
        
        return div;
    }

    getChallengeTitle(type) {
        const titles = {
            'photo': '📸 Challenge Foto',
            'steps': '🚶 Challenge Passi',
            'nfc': '📡 Challenge NFC',
            'qr': '📱 Challenge QR'
        };
        return titles[type] || 'Challenge';
    }

    getChallengeDescription(type) {
        const descriptions = {
            'photo': 'Scatta una foto del lavabo per verificare che sei in bagno',
            'steps': 'Fai almeno 120 passi in 2 minuti',
            'nfc': 'Avvicina il telefono al tag NFC in bagno',
            'qr': 'Scansiona il codice QR in bagno'
        };
        return descriptions[type] || 'Completa questo challenge';
    }

    startAlarmLoop(alarm) {
        this.escalationLevel = 0;
        
        this.loopInterval = setInterval(() => {
            this.escalateAlarm();
        }, 30000); // Ogni 30 secondi
    }

    escalateAlarm() {
        if (this.escalationLevel < this.maxEscalation) {
            this.escalationLevel++;
            
            // Aumenta volume
            this.playAlarmSound();
            
            // Aumenta vibrazione
            if ('vibrate' in navigator) {
                const vibrationPattern = Array(this.escalationLevel + 1).fill([200, 100, 200]).flat();
                navigator.vibrate(vibrationPattern);
            }
            
            // Mostra notifica di escalation
            this.showEscalationNotification();
            
            console.log(`Alarm escalation level: ${this.escalationLevel}`);
        }
    }

    showEscalationNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('WakeUpProof - Escalation!', {
                body: `Livello escalation: ${this.escalationLevel}. Completa i challenge per spegnere l'allarme!`,
                icon: '/icons/icon-192x192.png',
                tag: 'wakeup-proof-escalation'
            });
        }
    }

    async startChallenge(challengeId) {
        const challengeElement = document.getElementById(`challenge-${challengeId}`);
        if (!challengeElement) return;

        // Aggiorna stato
        const statusElement = challengeElement.querySelector('.challenge-status');
        statusElement.textContent = 'Attivo';
        statusElement.className = 'challenge-status active';

        // Avvia challenge specifico
        const challenge = await this.getChallengeById(challengeId);
        if (challenge) {
            await this.executeChallenge(challenge);
        }
    }

    async getChallengeById(challengeId) {
        // Implementazione per recuperare challenge dal database
        // Per ora ritorna un oggetto mock
        return {
            id: challengeId,
            type: 'photo', // o 'steps', 'nfc', 'qr'
            params: {}
        };
    }

    async executeChallenge(challenge) {
        switch (challenge.type) {
            case 'photo':
                await this.startPhotoChallenge(challenge);
                break;
            case 'steps':
                await this.startStepsChallenge(challenge);
                break;
            case 'nfc':
                await this.startNFCChallenge(challenge);
                break;
            case 'qr':
                await this.startQRChallenge(challenge);
                break;
        }
    }

    async startPhotoChallenge(challenge) {
        // Mostra sezione camera
        const cameraSection = document.getElementById('camera-section');
        if (cameraSection) {
            cameraSection.style.display = 'block';
        }

        // Avvia camera
        if (window.cameraHandler) {
            await window.cameraHandler.startCamera();
        }
    }

    async startStepsChallenge(challenge) {
        // Mostra sezione passi
        const stepsSection = document.getElementById('steps-section');
        if (stepsSection) {
            stepsSection.style.display = 'block';
        }

        // Avvia contapassi
        if (window.sensorsHandler) {
            await window.sensorsHandler.startStepsChallenge();
        }
    }

    async startNFCChallenge(challenge) {
        // Implementazione NFC
        console.log('Starting NFC challenge');
    }

    async startQRChallenge(challenge) {
        // Mostra sezione QR
        const nfcQrSection = document.getElementById('nfc-qr-section');
        if (nfcQrSection) {
            nfcQrSection.style.display = 'block';
        }

        // Avvia scanner QR
        if (window.cameraHandler) {
            await window.cameraHandler.startQRScanner();
        }
    }

    async completeChallenge(challengeId, success) {
        const challengeElement = document.getElementById(`challenge-${challengeId}`);
        if (!challengeElement) return;

        const statusElement = challengeElement.querySelector('.challenge-status');
        
        if (success) {
            statusElement.textContent = 'Completato';
            statusElement.className = 'challenge-status completed';
            
            // Controlla se tutti i challenge sono completati
            await this.checkAllChallengesCompleted();
        } else {
            statusElement.textContent = 'Fallito';
            statusElement.className = 'challenge-status error';
        }
    }

    async checkAllChallengesCompleted() {
        // Controlla se tutti i challenge sono completati
        const challengeElements = document.querySelectorAll('.challenge-item');
        const completedChallenges = document.querySelectorAll('.challenge-status.completed');
        
        if (challengeElements.length === completedChallenges.length) {
            await this.stopAlarm();
        }
    }

    async stopAlarm() {
        console.log('Stopping alarm');
        
        // Ferma loop
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        
        // Rilascia wake lock
        await this.releaseWakeLock();
        
        // Reset escalation
        this.escalationLevel = 0;
        
        // Nascondi sezioni challenge
        const sections = ['challenges-section', 'camera-section', 'steps-section', 'nfc-qr-section'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Aggiorna status
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
        }
        if (statusText) {
            statusText.textContent = 'Sistema pronto';
        }
        
        // Reset current alarm
        this.currentAlarm = null;
        
        // Salva metrica
        await database.saveMetric({
            alarmId: this.currentAlarm?.id,
            attempts: this.escalationLevel,
            successLatencyMs: Date.now() - (this.currentAlarm?.triggeredAt || Date.now())
        });
    }

    // API pubblica per creare allarmi
    async createAlarm(alarmData) {
        try {
            const alarm = await database.createAlarm(alarmData);
            this.scheduleAlarm(alarm);
            return alarm;
        } catch (error) {
            console.error('Error creating alarm:', error);
            throw error;
        }
    }

    scheduleAlarm(alarm) {
        this.activeAlarms.set(alarm.id, alarm);
        console.log('Alarm scheduled:', alarm);
    }

    async deleteAlarm(alarmId) {
        try {
            await database.deleteAlarm(alarmId);
            this.activeAlarms.delete(alarmId);
            
            if (this.alarmTimeouts.has(alarmId)) {
                clearTimeout(this.alarmTimeouts.get(alarmId));
                this.alarmTimeouts.delete(alarmId);
            }
        } catch (error) {
            console.error('Error deleting alarm:', error);
            throw error;
        }
    }
}

// Singleton instance
const alarmEngine = new AlarmEngine();

// Export for use in other modules
window.AlarmEngine = AlarmEngine;
window.alarmEngine = alarmEngine;
