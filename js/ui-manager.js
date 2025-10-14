// UI Manager per WakeUpProof PWA
// Gestisce interfaccia utente e interazioni

class UIManager {
    constructor() {
        this.currentView = 'alarms';
        this.modals = new Map();
        this.notifications = [];
        
        this.init();
    }

    async init() {
        console.log('UI Manager initialized');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Carica dati iniziali
        await this.loadInitialData();
        
        // Setup modals
        this.setupModals();
    }

    setupEventListeners() {
        // Add alarm button
        const addAlarmBtn = document.getElementById('add-alarm-btn');
        if (addAlarmBtn) {
            addAlarmBtn.addEventListener('click', () => this.showAddAlarmModal());
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }

        // Modal close
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        // Modal overlay click
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }
    }

    setupModals() {
        this.modals.set('add-alarm', {
            title: 'Nuovo Allarme',
            content: this.getAddAlarmModalContent()
        });

        this.modals.set('settings', {
            title: 'Impostazioni',
            content: this.getSettingsModalContent()
        });
    }

    async loadInitialData() {
        try {
            // Carica allarmi
            await this.loadAlarms();
            
            // Aggiorna UI
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadAlarms() {
        try {
            const alarms = await database.getAlarms();
            this.displayAlarms(alarms);
        } catch (error) {
            console.error('Error loading alarms:', error);
        }
    }

    displayAlarms(alarms) {
        const alarmsList = document.getElementById('alarms-list');
        if (!alarmsList) return;

        alarmsList.innerHTML = '';

        if (alarms.length === 0) {
            alarmsList.innerHTML = `
                <div class="empty-state">
                    <p>Nessun allarme configurato</p>
                    <p>Clicca "Nuovo Allarme" per iniziare</p>
                </div>
            `;
            return;
        }

        alarms.forEach(alarm => {
            const alarmElement = this.createAlarmElement(alarm);
            alarmsList.appendChild(alarmElement);
        });
    }

    createAlarmElement(alarm) {
        const div = document.createElement('div');
        div.className = 'alarm-item';
        div.id = `alarm-${alarm.id}`;
        
        const challengesText = alarm.challenges ? alarm.challenges.length : 0;
        const isActive = alarm.triggered || false;
        
        div.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${alarm.time}</div>
                <div class="alarm-challenges">${challengesText} challenge • ${alarm.recurrence}</div>
            </div>
            <div class="alarm-actions">
                <button class="btn-secondary" onclick="uiManager.editAlarm('${alarm.id}')">
                    ✏️ Modifica
                </button>
                <button class="btn-secondary" onclick="uiManager.toggleAlarm('${alarm.id}')">
                    ${alarm.enabled ? '⏸️ Pausa' : '▶️ Attiva'}
                </button>
                <button class="btn-secondary" onclick="uiManager.deleteAlarm('${alarm.id}')">
                    🗑️ Elimina
                </button>
            </div>
        `;

        if (isActive) {
            div.classList.add('active');
        }

        return div;
    }

    showAddAlarmModal() {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = 'Nuovo Allarme';
        modalBody.innerHTML = this.getAddAlarmModalContent();
        modal.style.display = 'flex';
    }

    getAddAlarmModalContent() {
        return `
            <form id="add-alarm-form" class="alarm-form">
                <div class="form-group">
                    <label for="alarm-time">Orario</label>
                    <input type="time" id="alarm-time" required>
                </div>
                
                <div class="form-group">
                    <label for="alarm-recurrence">Ripetizione</label>
                    <select id="alarm-recurrence" required>
                        <option value="daily">Giornaliero</option>
                        <option value="weekdays">Lun-Ven</option>
                        <option value="weekends">Sab-Dom</option>
                        <option value="once">Una volta</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Challenge</label>
                    <div class="challenge-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="challenge-photo" value="photo">
                            📸 Foto bagno
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="challenge-steps" value="steps">
                            🚶 Passi (120 in 2min)
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="challenge-nfc" value="nfc">
                            📡 NFC (Pro)
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="challenge-qr" value="qr">
                            📱 QR Code (Pro)
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="uiManager.closeModal()">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary">
                        Crea Allarme
                    </button>
                </div>
            </form>
        `;
    }

    showSettingsModal() {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = 'Impostazioni';
        modalBody.innerHTML = this.getSettingsModalContent();
        modal.style.display = 'flex';
    }

    getSettingsModalContent() {
        return `
            <div class="settings-content">
                <div class="settings-section">
                    <h4>Notifiche</h4>
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifications-enabled" checked>
                        Abilita notifiche
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="vibration-enabled" checked>
                        Abilita vibrazione
                    </label>
                </div>
                
                <div class="settings-section">
                    <h4>Privacy</h4>
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto-delete-photos" checked>
                        Auto-elimina foto dopo 24h
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="analytics-enabled">
                        Condividi dati anonimi (Pro)
                    </label>
                </div>
                
                <div class="settings-section">
                    <h4>Account</h4>
                    <p>Piano attuale: <strong>${subscriptionService.getCurrentPlan().toUpperCase()}</strong></p>
                    <button class="btn-secondary" onclick="subscriptionService.showSubscriptionModal()">
                        Gestisci Abbonamento
                    </button>
                </div>
                
                <div class="settings-section">
                    <h4>Dati</h4>
                    <button class="btn-secondary" onclick="uiManager.exportData()">
                        Esporta Dati
                    </button>
                    <button class="btn-secondary" onclick="uiManager.clearData()">
                        Cancella Tutti i Dati
                    </button>
                </div>
                
                <div class="settings-actions">
                    <button class="btn-primary" onclick="uiManager.closeModal()">
                        Chiudi
                    </button>
                </div>
            </div>
        `;
    }

    // Alarm management
    async createAlarm(formData) {
        try {
            const alarmData = {
                time: formData.time,
                recurrence: formData.recurrence,
                challenges: formData.challenges || [],
                enabled: true
            };

            const alarm = await alarmEngine.createAlarm(alarmData);
            
            // Crea challenge se selezionati
            if (formData.challenges && formData.challenges.length > 0) {
                for (const challengeType of formData.challenges) {
                    await challengeEngine.createChallenge(alarm.id, challengeType);
                }
            }

            // Ricarica allarmi
            await this.loadAlarms();
            
            this.showSuccessMessage('Allarme creato con successo!');
            this.closeModal();
            
        } catch (error) {
            console.error('Error creating alarm:', error);
            this.showErrorMessage('Errore durante la creazione dell\'allarme');
        }
    }

    async editAlarm(alarmId) {
        try {
            const alarms = await database.getAlarms();
            const alarm = alarms.find(a => a.id === alarmId);
            
            if (!alarm) {
                this.showErrorMessage('Allarme non trovato');
                return;
            }

            // Mostra modal di modifica
            this.showEditAlarmModal(alarm);
            
        } catch (error) {
            console.error('Error editing alarm:', error);
            this.showErrorMessage('Errore durante la modifica dell\'allarme');
        }
    }

    showEditAlarmModal(alarm) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = 'Modifica Allarme';
        modalBody.innerHTML = `
            <form id="edit-alarm-form" class="alarm-form">
                <input type="hidden" id="alarm-id" value="${alarm.id}">
                
                <div class="form-group">
                    <label for="edit-alarm-time">Orario</label>
                    <input type="time" id="edit-alarm-time" value="${alarm.time}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-alarm-recurrence">Ripetizione</label>
                    <select id="edit-alarm-recurrence" required>
                        <option value="daily" ${alarm.recurrence === 'daily' ? 'selected' : ''}>Giornaliero</option>
                        <option value="weekdays" ${alarm.recurrence === 'weekdays' ? 'selected' : ''}>Lun-Ven</option>
                        <option value="weekends" ${alarm.recurrence === 'weekends' ? 'selected' : ''}>Sab-Dom</option>
                        <option value="once" ${alarm.recurrence === 'once' ? 'selected' : ''}>Una volta</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="uiManager.closeModal()">
                        Annulla
                    </button>
                    <button type="submit" class="btn-primary">
                        Salva Modifiche
                    </button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';
    }

    async toggleAlarm(alarmId) {
        try {
            const alarms = await database.getAlarms();
            const alarm = alarms.find(a => a.id === alarmId);
            
            if (!alarm) {
                this.showErrorMessage('Allarme non trovato');
                return;
            }

            await database.updateAlarm(alarmId, { enabled: !alarm.enabled });
            
            // Ricarica allarmi
            await this.loadAlarms();
            
            this.showSuccessMessage(`Allarme ${alarm.enabled ? 'pausato' : 'attivato'}`);
            
        } catch (error) {
            console.error('Error toggling alarm:', error);
            this.showErrorMessage('Errore durante la modifica dell\'allarme');
        }
    }

    async deleteAlarm(alarmId) {
        if (!confirm('Sei sicuro di voler eliminare questo allarme?')) {
            return;
        }

        try {
            await alarmEngine.deleteAlarm(alarmId);
            
            // Ricarica allarmi
            await this.loadAlarms();
            
            this.showSuccessMessage('Allarme eliminato');
            
        } catch (error) {
            console.error('Error deleting alarm:', error);
            this.showErrorMessage('Errore durante l\'eliminazione dell\'allarme');
        }
    }

    // Data management
    async exportData() {
        try {
            const data = await database.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `wakeup-proof-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showSuccessMessage('Dati esportati con successo!');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showErrorMessage('Errore durante l\'esportazione dei dati');
        }
    }

    async clearData() {
        if (!confirm('Sei sicuro di voler cancellare TUTTI i dati? Questa azione non può essere annullata.')) {
            return;
        }

        try {
            await database.clearAllData();
            
            // Ricarica UI
            await this.loadInitialData();
            
            this.showSuccessMessage('Tutti i dati sono stati cancellati');
            
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showErrorMessage('Errore durante la cancellazione dei dati');
        }
    }

    // Modal management
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Notifications
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

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    updateUI() {
        // Aggiorna UI basata sullo stato corrente
        this.updateAlarmStatus();
        this.updateSubscriptionStatus();
    }

    updateAlarmStatus() {
        // Aggiorna status allarme
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (statusIndicator && statusText) {
            // Logica per aggiornare status
        }
    }

    updateSubscriptionStatus() {
        // Aggiorna UI abbonamento
        const subscriptionBtn = document.getElementById('subscription-btn');
        if (subscriptionBtn) {
            const plan = subscriptionService.getCurrentPlan();
            subscriptionBtn.textContent = `💳 ${plan.toUpperCase()}`;
        }
    }
}

// Singleton instance
const uiManager = new UIManager();

// Export for use in other modules
window.UIManager = UIManager;
window.uiManager = uiManager;
