# 🔑 Configurazione Pagamenti Admin

## 🎯 **PANORAMICA**

L'area admin di WakeUpProof include una sezione dedicata alla configurazione dei pagamenti, dove è possibile gestire le chiavi API di Stripe, PayPal, Apple Pay e Google Pay.

## 🏗️ **SEZIONE PAGAMENTI**

### **📍 Accesso**
1. **Login come admin** con credenziali:
   - Email: `admin@wakeupproof.com` o `250862-italia@admin.com`
   - Password: `admin123`
2. **Clicca su "🔑 Pagamenti"** nella tab admin
3. **Configura** le chiavi API per i vari provider

## 💳 **STRIPE CONFIGURATION**

### **🔑 Chiavi Richieste**
- **Chiave Pubblica**: `pk_test_...` (per il frontend)
- **Chiave Segreta**: `sk_test_...` (per il backend)
- **Webhook Secret**: `whsec_...` (per validare webhook)

### **📋 Come Ottenere le Chiavi**
1. **Registrati su [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Vai su "Developers" > "API Keys"**
3. **Copia le chiavi** e incollale nell'admin
4. **Configura webhook** su `https://tuo-dominio.com/webhook/stripe`

### **✅ Test Connessione**
- **Clicca "🧪 Test Connessione"** per verificare
- **Stato verde** = connessione OK
- **Stato rosso** = errore configurazione

## 🅿️ **PAYPAL CONFIGURATION**

### **🔑 Chiavi Richieste**
- **Client ID**: `sb-...` (per l'integrazione)
- **Client Secret**: `...` (per l'autenticazione)
- **Webhook ID**: `...` (per le notifiche)

### **📋 Come Ottenere le Chiavi**
1. **Registrati su [PayPal Developer](https://developer.paypal.com)**
2. **Crea una nuova app** nel dashboard
3. **Copia Client ID e Secret**
4. **Configura webhook** per le notifiche

### **✅ Test Connessione**
- **Clicca "🧪 Test Connessione"** per verificare
- **Stato verde** = connessione OK
- **Stato rosso** = errore configurazione

## 🍎 **APPLE PAY & GOOGLE PAY**

### **🔑 Configurazioni Richieste**
- **Apple Pay Domain**: `wakeupproof.com` (dominio verificato)
- **Google Pay Merchant ID**: `merchant_...` (ID commerciante)

### **📋 Come Configurare**
1. **Apple Pay**: Verifica il dominio su Apple Developer
2. **Google Pay**: Ottieni Merchant ID da Google Pay Console
3. **Inserisci** le configurazioni nell'admin

### **✅ Test Connessione**
- **Clicca "🧪 Test Connessione"** per verificare
- **Stato verde** = connessione OK
- **Stato rosso** = errore configurazione

## 📊 **MONITORAGGIO PAGAMENTI**

### **📈 Statistiche in Tempo Reale**
- **Stato Stripe**: Connessione attiva/errore
- **Stato PayPal**: Connessione attiva/errore
- **Webhook Stripe**: Attivo/inattivo
- **Webhook PayPal**: Attivo/inattivo

### **🔄 Aggiornamento Stato**
- **Clicca "🔄 Aggiorna Stato"** per refresh
- **Stato automatico** ogni 5 minuti
- **Notifiche** in caso di errori

### **📋 Log Pagamenti**
- **Clicca "📋 Visualizza Log"** per vedere i log
- **Filtri** per livello (INFO, WARN, ERROR)
- **Esportazione** log in CSV/JSON

## 🛡️ **SICUREZZA**

### **🔒 Protezione Chiavi**
- **Chiavi segrete** sono nascoste nell'input
- **Salvataggio sicuro** in localStorage
- **Validazione** delle chiavi prima del salvataggio

### **⚠️ Best Practices**
- **Non condividere** le chiavi segrete
- **Usa chiavi test** per sviluppo
- **Usa chiavi produzione** solo in produzione
- **Monitora** gli accessi alle chiavi

## 🚀 **DEPLOYMENT**

### **🔧 Configurazione Produzione**
1. **Sostituisci chiavi test** con chiavi produzione
2. **Configura webhook** reali
3. **Testa** tutte le connessioni
4. **Monitora** i log per errori

### **📱 Mobile Pay**
- **Verifica dominio** per Apple Pay
- **Configura Merchant ID** per Google Pay
- **Testa** su dispositivi reali

## 🎯 **FUNZIONALITÀ**

### **✅ Gestione Completa**
- [x] **Configurazione Stripe** con chiavi pubbliche/segrete
- [x] **Configurazione PayPal** con Client ID/Secret
- [x] **Configurazione Mobile Pay** (Apple/Google)
- [x] **Test connessioni** per tutti i provider
- [x] **Monitoraggio stato** in tempo reale
- [x] **Log pagamenti** con filtri e esportazione
- [x] **Salvataggio sicuro** delle configurazioni
- [x] **Validazione** delle chiavi API

### **🎨 Interfaccia Utente**
- **Form organizzati** per ogni provider
- **Validazione** in tempo reale
- **Stato visivo** delle connessioni
- **Log dettagliati** con colori
- **Esportazione** dati

## 📋 **CHECKLIST CONFIGURAZIONE**

### **🔧 Setup Iniziale**
- [ ] **Registrati** su Stripe Dashboard
- [ ] **Registrati** su PayPal Developer
- [ ] **Configura** Apple Pay domain
- [ ] **Ottieni** Google Pay Merchant ID
- [ ] **Inserisci** tutte le chiavi nell'admin
- [ ] **Testa** tutte le connessioni
- [ ] **Verifica** webhook funzionanti

### **🚀 Produzione**
- [ ] **Sostituisci** chiavi test con produzione
- [ ] **Configura** webhook reali
- [ ] **Testa** pagamenti reali
- [ ] **Monitora** log per errori
- [ ] **Backup** configurazioni

## 🎉 **RISULTATO**

L'area admin di WakeUpProof ora include una **sezione completa per la configurazione dei pagamenti** che permette di:

- ✅ **Gestire** tutte le chiavi API
- ✅ **Testare** le connessioni
- ✅ **Monitorare** lo stato dei pagamenti
- ✅ **Visualizzare** i log dettagliati
- ✅ **Esportare** i dati
- ✅ **Configurare** webhook
- ✅ **Gestire** Mobile Pay

**Tutto pronto per la produzione!** 🚀💰
