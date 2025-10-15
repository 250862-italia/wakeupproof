// Main App per WakeUpProof PWA
// Coordina tutti i moduli e gestisce il ciclo di vita dell'app

class WakeUpProofApp {
    constructor() {
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        this.currentAlarm = null;
        
        this.init();
    }

    async init() {
        console.log('WakeUpProof App starting...');
        
        try {
            // Inizializza database
            await this.initializeDatabase();
            
            // Inizializza servizi
            await this.initializeServices();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Inizializza UI
            await this.initializeUI();
            
            // Controlla stato iniziale
            await this.checkInitialState();
            
            this.isInitialized = true;
            console.log('WakeUpProof App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showInitializationError(error);
        }
    }

    async initializeDatabase() {
        console.log('Initializing database...');
        
        try {
            await database.init();
            console.log('Database initialized');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    async initializeServices() {
        console.log('Initializing services...');
        
        // I servizi si auto-inizializzano quando vengono importati
        // Qui possiamo fare setup aggiuntivo se necessario
        
        console.log('Services initialized');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Online/Offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // Visibility change (app in background/foreground)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppHidden();
            } else {
                this.handleAppVisible();
            }
        });

        // Before unload (app closing)
        window.addEventListener('beforeunload', () => {
            this.handleAppClosing();
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Challenge completions
        document.addEventListener('challengeCompleted', (e) => {
            this.handleChallengeCompleted(e.detail);
        });

        // Alarm events
        document.addEventListener('alarmTriggered', (e) => {
            this.handleAlarmTriggered(e.detail);
        });

        console.log('Event listeners setup complete');
    }

    async initializeUI() {
        console.log('Initializing UI...');
        
        // L'UI Manager si auto-inizializza
        // Qui possiamo fare setup aggiuntivo se necessario
        
        console.log('UI initialized');
    }

    async checkInitialState() {
        console.log('Checking initial state...');
        
        try {
            // Controlla se ci sono allarmi attivi
            const alarms = await database.getAlarms();
            const activeAlarms = alarms.filter(alarm => alarm.enabled);
            
            if (activeAlarms.length > 0) {
                console.log(`Found ${activeAlarms.length} active alarms`);
            }
            
            // Controlla stato abbonamento
            const subscription = subscriptionService.getCurrentPlan();
            console.log('Current subscription:', subscription);
            
            // Controlla permessi
            await this.checkPermissions();
            
        } catch (error) {
            console.error('Error checking initial state:', error);
        }
    }

    async checkPermissions() {
        console.log('Checking permissions...');
        
        const permissions = {
            notifications: false,
            camera: false,
            motion: false
        };

        // Notifications
        if ('Notification' in window) {
            permissions.notifications = Notification.permission === 'granted';
        }

        // Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            permissions.camera = true;
        } catch (error) {
            console.warn('Camera permission not granted:', error);
        }

        // Motion sensors
        if ('DeviceMotionEvent' in window) {
            permissions.motion = true;
        }

        console.log('Permissions:', permissions);
        
        // Mostra warning se permessi mancanti
        if (!permissions.notifications) {
            this.showPermissionWarning('notifications', 'Le notifiche sono necessarie per gli allarmi');
        }
        
        if (!permissions.camera) {
            this.showPermissionWarning('camera', 'La camera è necessaria per i challenge foto e QR');
        }
    }

    showPermissionWarning(type, message) {
        const notification = document.createElement('div');
        notification.className = 'notification warning';
        notification.innerHTML = `
            <strong>Permesso ${type} richiesto</strong><br>
            ${message}
        `;
        
        const notifications = document.getElementById('notifications');
        if (notifications) {
            notifications.appendChild(notification);
        }
    }

    // Event handlers
    handleOnlineStatus() {
        console.log('App is online');
        // Sincronizza dati se necessario
    }

    handleOfflineStatus() {
        console.log('App is offline');
        // L'app funziona offline, nessuna azione necessaria
    }

    handleAppHidden() {
        console.log('App hidden');
        // L'app è in background
        // Gli allarmi continuano a funzionare grazie al service worker
    }

    handleAppVisible() {
        console.log('App visible');
        // L'app è tornata in primo piano
        // Aggiorna UI se necessario
    }

    handleAppClosing() {
        console.log('App closing');
        // Cleanup se necessario
    }

    handleFormSubmission(e) {
        const form = e.target;
        
        if (form.id === 'add-alarm-form') {
            e.preventDefault();
            this.handleAddAlarmForm(form);
        } else if (form.id === 'edit-alarm-form') {
            e.preventDefault();
            this.handleEditAlarmForm(form);
        }
    }

    async handleAddAlarmForm(form) {
        const formData = new FormData(form);
        const alarmData = {
            time: formData.get('alarm-time') || form.querySelector('#alarm-time').value,
            recurrence: formData.get('alarm-recurrence') || form.querySelector('#alarm-recurrence').value,
            challenges: []
        };

        // Raccogli challenge selezionati
        const challengeCheckboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        challengeCheckboxes.forEach(checkbox => {
            alarmData.challenges.push(checkbox.value);
        });

        await uiManager.createAlarm(alarmData);
    }

    async handleEditAlarmForm(form) {
        const alarmId = form.querySelector('#alarm-id').value;
        const alarmData = {
            time: form.querySelector('#edit-alarm-time').value,
            recurrence: form.querySelector('#edit-alarm-recurrence').value
        };

        try {
            await database.updateAlarm(alarmId, alarmData);
            await uiManager.loadAlarms();
            uiManager.showSuccessMessage('Allarme aggiornato!');
            uiManager.closeModal();
        } catch (error) {
            console.error('Error updating alarm:', error);
            uiManager.showErrorMessage('Errore durante l\'aggiornamento dell\'allarme');
        }
    }

    handleChallengeCompleted(detail) {
        console.log('Challenge completed:', detail);
        
        const { challengeId, success } = detail;
        
        if (success) {
            uiManager.showSuccessMessage('Challenge completato!');
        } else {
            uiManager.showErrorMessage('Challenge fallito. Riprova!');
        }
    }

    handleAlarmTriggered(detail) {
        console.log('Alarm triggered:', detail);
        
        const { alarm } = detail;
        this.currentAlarm = alarm;
        
        // Mostra notifica
        uiManager.showNotification('Allarme attivato! Completa i challenge per spegnere l\'allarme.', 'warning');
    }

    showInitializationError(error) {
        const errorMessage = `
            <div class="error-state">
                <h2>Errore di Inizializzazione</h2>
                <p>Impossibile avviare l'applicazione:</p>
                <p><code>${error.message}</code></p>
                <button class="btn-primary" onclick="location.reload()">
                    Ricarica Pagina
                </button>
            </div>
        `;
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = errorMessage;
        }
    }

    // API pubblica
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            currentAlarm: this.currentAlarm,
            subscription: subscriptionService.getCurrentPlan()
        };
    }

    async restart() {
        console.log('Restarting app...');
        
        // Cleanup
        if (window.alarmEngine) {
            // Cleanup alarm engine
        }
        
        if (window.challengeEngine) {
            challengeEngine.cleanup();
        }
        
        if (window.cameraHandler) {
            await cameraHandler.cleanup();
        }
        
        if (window.sensorsHandler) {
            await sensorsHandler.cleanup();
        }
        
        // Reinitialize
        await this.init();
    }

    // Debug methods
    async debugInfo() {
        const info = {
            app: this.getAppState(),
            database: await this.getDatabaseInfo(),
            permissions: await this.getPermissionsInfo(),
            features: subscriptionService.getCurrentFeatures()
        };
        
        console.log('Debug info:', info);
        return info;
    }

    async getDatabaseInfo() {
        try {
            const alarms = await database.getAlarms();
            const metrics = await database.getMetrics(7);
            
            return {
                alarms: alarms.length,
                metrics: metrics.length,
                lastMetric: metrics[metrics.length - 1]
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getPermissionsInfo() {
        const permissions = {
            notifications: Notification.permission,
            camera: false,
            motion: 'DeviceMotionEvent' in window
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            permissions.camera = true;
        } catch (error) {
            permissions.camera = false;
        }

        return permissions;
    }
}

// Inizializza app quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing WakeUpProof App...');
    
    // Crea istanza app
    const app = new WakeUpProofApp();
    
    // Esponi globalmente per debug
    window.wakeUpProofApp = app;
    
    console.log('WakeUpProof App instance created');
});

// Export per altri moduli
window.WakeUpProofApp = WakeUpProofApp;
