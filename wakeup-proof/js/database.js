// Database Layer per WakeUpProof PWA
// Utilizza IndexedDB per storage locale sicuro

class DatabaseManager {
    constructor() {
        this.dbName = 'WakeUpProofDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createTables(db);
            };
        });
    }

    createTables(db) {
        // Tabella Allarmi
        if (!db.objectStoreNames.contains('alarms')) {
            const alarmStore = db.createObjectStore('alarms', { keyPath: 'id' });
            alarmStore.createIndex('time', 'time', { unique: false });
            alarmStore.createIndex('enabled', 'enabled', { unique: false });
        }

        // Tabella Challenge
        if (!db.objectStoreNames.contains('challenges')) {
            const challengeStore = db.createObjectStore('challenges', { keyPath: 'id' });
            challengeStore.createIndex('alarmId', 'alarmId', { unique: false });
            challengeStore.createIndex('type', 'type', { unique: false });
            challengeStore.createIndex('enabled', 'enabled', { unique: false });
        }

        // Tabella Template Foto
        if (!db.objectStoreNames.contains('photoTemplates')) {
            const templateStore = db.createObjectStore('photoTemplates', { keyPath: 'id' });
            templateStore.createIndex('alarmId', 'alarmId', { unique: false });
            templateStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Tabella Metriche
        if (!db.objectStoreNames.contains('metrics')) {
            const metricsStore = db.createObjectStore('metrics', { keyPath: 'id', autoIncrement: true });
            metricsStore.createIndex('date', 'date', { unique: false });
            metricsStore.createIndex('alarmId', 'alarmId', { unique: false });
        }

        // Tabella Configurazioni
        if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'key' });
        }
    }

    // CRUD Operations per Allarmi
    async createAlarm(alarm) {
        const transaction = this.db.transaction(['alarms'], 'readwrite');
        const store = transaction.objectStore('alarms');
        
        const alarmData = {
            id: this.generateId(),
            time: alarm.time,
            recurrence: alarm.recurrence || 'daily',
            enabled: alarm.enabled !== false,
            challenges: alarm.challenges || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(alarmData);
            request.onsuccess = () => resolve(alarmData);
            request.onerror = () => reject(request.error);
        });
    }

    async getAlarms() {
        const transaction = this.db.transaction(['alarms'], 'readonly');
        const store = transaction.objectStore('alarms');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateAlarm(id, updates) {
        const transaction = this.db.transaction(['alarms'], 'readwrite');
        const store = transaction.objectStore('alarms');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const alarm = getRequest.result;
                if (alarm) {
                    const updatedAlarm = { ...alarm, ...updates, updatedAt: new Date().toISOString() };
                    const putRequest = store.put(updatedAlarm);
                    putRequest.onsuccess = () => resolve(updatedAlarm);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('Alarm not found'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteAlarm(id) {
        const transaction = this.db.transaction(['alarms'], 'readwrite');
        const store = transaction.objectStore('alarms');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // CRUD Operations per Challenge
    async createChallenge(challenge) {
        const transaction = this.db.transaction(['challenges'], 'readwrite');
        const store = transaction.objectStore('challenges');
        
        const challengeData = {
            id: this.generateId(),
            alarmId: challenge.alarmId,
            type: challenge.type,
            params: challenge.params || {},
            enabled: challenge.enabled !== false,
            createdAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(challengeData);
            request.onsuccess = () => resolve(challengeData);
            request.onerror = () => reject(request.error);
        });
    }

    async getChallengesByAlarm(alarmId) {
        const transaction = this.db.transaction(['challenges'], 'readonly');
        const store = transaction.objectStore('challenges');
        const index = store.index('alarmId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(alarmId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Template Foto
    async savePhotoTemplate(template) {
        const transaction = this.db.transaction(['photoTemplates'], 'readwrite');
        const store = transaction.objectStore('photoTemplates');
        
        const templateData = {
            id: this.generateId(),
            alarmId: template.alarmId,
            vector: template.vector,
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(templateData);
            request.onsuccess = () => resolve(templateData);
            request.onerror = () => reject(request.error);
        });
    }

    async getPhotoTemplate(alarmId) {
        const transaction = this.db.transaction(['photoTemplates'], 'readonly');
        const store = transaction.objectStore('photoTemplates');
        const index = store.index('alarmId');
        
        return new Promise((resolve, reject) => {
            const request = index.get(alarmId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Metriche
    async saveMetric(metric) {
        const transaction = this.db.transaction(['metrics'], 'readwrite');
        const store = transaction.objectStore('metrics');
        
        const metricData = {
            date: metric.date || new Date().toISOString().split('T')[0],
            alarmId: metric.alarmId,
            attempts: metric.attempts || 0,
            successLatencyMs: metric.successLatencyMs || 0,
            falseRejects: metric.falseRejects || 0,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const request = store.add(metricData);
            request.onsuccess = () => resolve(metricData);
            request.onerror = () => reject(request.error);
        });
    }

    async getMetrics(dateRange = 30) {
        const transaction = this.db.transaction(['metrics'], 'readonly');
        const store = transaction.objectStore('metrics');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const metrics = request.result;
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - dateRange);
                
                const filteredMetrics = metrics.filter(metric => 
                    new Date(metric.date) >= cutoffDate
                );
                
                resolve(filteredMetrics);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Configurazioni
    async setConfig(key, value) {
        const transaction = this.db.transaction(['config'], 'readwrite');
        const store = transaction.objectStore('config');
        
        return new Promise((resolve, reject) => {
            const request = store.put({ key, value, updatedAt: new Date().toISOString() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getConfig(key) {
        const transaction = this.db.transaction(['config'], 'readonly');
        const store = transaction.objectStore('config');
        
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Utility functions
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Cleanup old data (privacy compliance)
    async cleanupOldData(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        // Cleanup photo templates
        const transaction = this.db.transaction(['photoTemplates'], 'readwrite');
        const store = transaction.objectStore('photoTemplates');
        const index = store.index('timestamp');
        
        return new Promise((resolve, reject) => {
            const request = index.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.timestamp < cutoffDate.getTime()) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Export data (GDPR compliance)
    async exportData() {
        const alarms = await this.getAlarms();
        const metrics = await this.getMetrics(365);
        
        return {
            alarms,
            metrics,
            exportDate: new Date().toISOString(),
            version: this.version
        };
    }

    // Clear all data
    async clearAllData() {
        const stores = ['alarms', 'challenges', 'photoTemplates', 'metrics', 'config'];
        const transaction = this.db.transaction(stores, 'readwrite');
        
        return Promise.all(
            stores.map(storeName => {
                const store = transaction.objectStore(storeName);
                return new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            })
        );
    }
}

// Singleton instance
const database = new DatabaseManager();

// Export for use in other modules
window.DatabaseManager = DatabaseManager;
window.database = database;
