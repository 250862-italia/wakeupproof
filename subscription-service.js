// Subscription Service per WakeUpProof PWA
// Gestisce abbonamenti Free/Pro/Premium

class SubscriptionService {
    constructor() {
        this.currentPlan = 'free';
        this.subscriptionData = null;
        this.features = {
            free: {
                maxAlarms: 1,
                maxChallenges: 2,
                nfcEnabled: false,
                qrEnabled: false,
                analytics: false,
                customSounds: false
            },
            pro: {
                maxAlarms: 5,
                maxChallenges: 100,
                nfcEnabled: true,
                qrEnabled: true,
                analytics: true,
                customSounds: true
            },
            premium: {
                maxAlarms: -1, // Illimitati
                maxChallenges: -1, // Illimitati
                nfcEnabled: true,
                qrEnabled: true,
                analytics: true,
                customSounds: true,
                customChallenges: true,
                coaching: true
            }
        };
        
        this.init();
    }

    async init() {
        // Carica dati abbonamento dal database
        await this.loadSubscriptionData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Subscription Service initialized');
    }

    async loadSubscriptionData() {
        try {
            const subscriptionData = await database.getConfig('subscription');
            if (subscriptionData) {
                this.subscriptionData = subscriptionData;
                this.currentPlan = subscriptionData.plan || 'free';
            }
        } catch (error) {
            console.error('Error loading subscription data:', error);
        }
    }

    setupEventListeners() {
        // Subscription button
        const subscriptionBtn = document.getElementById('subscription-btn');
        if (subscriptionBtn) {
            subscriptionBtn.addEventListener('click', () => this.showSubscriptionModal());
        }
    }

    async showSubscriptionModal() {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = 'Piani di Abbonamento';
        
        modalBody.innerHTML = `
            <div class="subscription-plans">
                <div class="plan-card ${this.currentPlan === 'free' ? 'current' : ''}">
                    <h3>Free</h3>
                    <div class="plan-price">€0/mese</div>
                    <ul class="plan-features">
                        <li>1 allarme</li>
                        <li>2 challenge</li>
                        <li>Challenge base</li>
                        <li>Supporto email</li>
                    </ul>
                    ${this.currentPlan === 'free' ? '<div class="current-badge">Piano Attuale</div>' : ''}
                </div>
                
                <div class="plan-card ${this.currentPlan === 'pro' ? 'current' : ''}">
                    <h3>Pro</h3>
                    <div class="plan-price">€4.99/mese</div>
                    <ul class="plan-features">
                        <li>5 allarmi</li>
                        <li>100 challenge</li>
                        <li>NFC & QR</li>
                        <li>Analytics</li>
                        <li>Suoni personalizzati</li>
                    </ul>
                    ${this.currentPlan === 'pro' ? '<div class="current-badge">Piano Attuale</div>' : 
                      this.currentPlan === 'free' ? '<button class="btn-primary" onclick="subscriptionService.upgradeToPro()">Upgrade</button>' : ''}
                </div>
                
                <div class="plan-card ${this.currentPlan === 'premium' ? 'current' : ''}">
                    <h3>Premium</h3>
                    <div class="plan-price">€9.99/mese</div>
                    <ul class="plan-features">
                        <li>Allarmi illimitati</li>
                        <li>Challenge illimitati</li>
                        <li>Tutti i feature Pro</li>
                        <li>Challenge personalizzati</li>
                        <li>Coaching AI</li>
                        <li>Supporto prioritario</li>
                    </ul>
                    ${this.currentPlan === 'premium' ? '<div class="current-badge">Piano Attuale</div>' : 
                      this.currentPlan !== 'premium' ? '<button class="btn-primary" onclick="subscriptionService.upgradeToPremium()">Upgrade</button>' : ''}
                </div>
            </div>
            
            <div class="subscription-actions">
                <button class="btn-secondary" onclick="subscriptionService.closeModal()">Chiudi</button>
                ${this.currentPlan !== 'free' ? '<button class="btn-secondary" onclick="subscriptionService.cancelSubscription()">Annulla Abbonamento</button>' : ''}
            </div>
        `;

        modal.style.display = 'flex';
    }

    async upgradeToPro() {
        try {
            console.log('Upgrading to Pro plan...');
            
            // Simula upgrade (in produzione useresti Stripe)
            await this.simulateUpgrade('pro', 4.99);
            
            this.showSuccessMessage('Upgrade a Pro completato!');
            this.closeModal();
            
        } catch (error) {
            console.error('Error upgrading to Pro:', error);
            this.showErrorMessage('Errore durante l\'upgrade. Riprova.');
        }
    }

    async upgradeToPremium() {
        try {
            console.log('Upgrading to Premium plan...');
            
            // Simula upgrade (in produzione useresti Stripe)
            await this.simulateUpgrade('premium', 9.99);
            
            this.showSuccessMessage('Upgrade a Premium completato!');
            this.closeModal();
            
        } catch (error) {
            console.error('Error upgrading to Premium:', error);
            this.showErrorMessage('Errore durante l\'upgrade. Riprova.');
        }
    }

    async simulateUpgrade(plan, price) {
        // Simula upgrade per demo
        const subscriptionData = {
            plan: plan,
            price: price,
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni
            paymentMethod: 'stripe',
            customerId: 'mock-customer-' + Date.now()
        };

        // Salva nel database
        await database.setConfig('subscription', subscriptionData);
        
        // Aggiorna stato locale
        this.subscriptionData = subscriptionData;
        this.currentPlan = plan;
        
        // Aggiorna UI
        this.updateUI();
        
        // Notifica altri servizi
        this.notifyPlanChange(plan);
    }

    async cancelSubscription() {
        try {
            console.log('Cancelling subscription...');
            
            // Simula cancellazione
            const subscriptionData = {
                ...this.subscriptionData,
                status: 'cancelled',
                cancelledDate: new Date().toISOString()
            };

            await database.setConfig('subscription', subscriptionData);
            
            // Downgrade a Free
            this.subscriptionData = subscriptionData;
            this.currentPlan = 'free';
            
            this.updateUI();
            this.notifyPlanChange('free');
            
            this.showSuccessMessage('Abbonamento annullato. Downgrade a Free completato.');
            this.closeModal();
            
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            this.showErrorMessage('Errore durante la cancellazione. Riprova.');
        }
    }

    updateUI() {
        // Aggiorna badge subscription
        const subscriptionBtn = document.getElementById('subscription-btn');
        if (subscriptionBtn) {
            const planNames = {
                free: 'Free',
                pro: 'Pro',
                premium: 'Premium'
            };
            
            subscriptionBtn.textContent = `💳 ${planNames[this.currentPlan]}`;
        }

        // Aggiorna limiti UI
        this.updateFeatureLimits();
    }

    updateFeatureLimits() {
        const features = this.getCurrentFeatures();
        
        // Aggiorna limiti allarmi
        const addAlarmBtn = document.getElementById('add-alarm-btn');
        if (addAlarmBtn) {
            if (features.maxAlarms === -1) {
                addAlarmBtn.textContent = '+ Nuovo Allarme (Illimitato)';
            } else {
                addAlarmBtn.textContent = `+ Nuovo Allarme (${features.maxAlarms} max)`;
            }
        }
    }

    notifyPlanChange(newPlan) {
        // Notifica altri servizi del cambio piano
        if (window.alarmEngine) {
            // Aggiorna limiti allarmi
            console.log('Plan changed to:', newPlan);
        }
    }

    // Feature checking
    canCreateAlarm() {
        const features = this.getCurrentFeatures();
        if (features.maxAlarms === -1) return true;
        
        // Conta allarmi esistenti
        return this.getAlarmCount() < features.maxAlarms;
    }

    canCreateChallenge() {
        const features = this.getCurrentFeatures();
        if (features.maxChallenges === -1) return true;
        
        // Conta challenge esistenti
        return this.getChallengeCount() < features.maxChallenges;
    }

    isFeatureEnabled(feature) {
        const features = this.getCurrentFeatures();
        return features[feature] === true;
    }

    getCurrentFeatures() {
        return this.features[this.currentPlan] || this.features.free;
    }

    async getAlarmCount() {
        try {
            const alarms = await database.getAlarms();
            return alarms.length;
        } catch (error) {
            console.error('Error getting alarm count:', error);
            return 0;
        }
    }

    async getChallengeCount() {
        try {
            const alarms = await database.getAlarms();
            let totalChallenges = 0;
            
            for (const alarm of alarms) {
                const challenges = await database.getChallengesByAlarm(alarm.id);
                totalChallenges += challenges.length;
            }
            
            return totalChallenges;
        } catch (error) {
            console.error('Error getting challenge count:', error);
            return 0;
        }
    }

    // API pubblica
    getCurrentPlan() {
        return this.currentPlan;
    }

    getSubscriptionData() {
        return this.subscriptionData;
    }

    isProOrHigher() {
        return this.currentPlan === 'pro' || this.currentPlan === 'premium';
    }

    isPremium() {
        return this.currentPlan === 'premium';
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
}

// Singleton instance
const subscriptionService = new SubscriptionService();

// Export for use in other modules
window.SubscriptionService = SubscriptionService;
window.subscriptionService = subscriptionService;
