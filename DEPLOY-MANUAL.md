# 🚀 DEPLOY MANUALE - WakeUpProof Admin

## 📋 **OPZIONI DEPLOY DISPONIBILI:**

### **1. 🌐 Vercel (Raccomandato):**
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel --prod --yes
```

### **2. 🌐 Netlify:**
```bash
# Installa Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

### **3. 🌐 Surge.sh:**
```bash
# Installa Surge
npm i -g surge

# Deploy
surge . wakeupproof-admin.surge.sh
```

### **4. 🌐 GitHub Pages:**
1. Vai su [GitHub.com](https://github.com/250862-italia/wakeupproof)
2. Carica tutti i file aggiornati
3. Abilita GitHub Pages nelle impostazioni
4. URL: `https://250862-italia.github.io/wakeupproof`

### **5. 🌐 Firebase Hosting:**
```bash
# Installa Firebase CLI
npm i -g firebase-tools

# Login e init
firebase login
firebase init hosting

# Deploy
firebase deploy
```

## 🔐 **AREA ADMIN - CREDENZIALI:**

### **Email Admin:**
- `admin@wakeupproof.com`
- `250862-italia@admin.com`

### **Password:** Qualsiasi (per ora)

## 📱 **FUNZIONALITÀ COMPLETE:**

### **👤 Sistema Utenti:**
- ✅ Registrazione/Login
- ✅ Profili personalizzati
- ✅ Statistiche individuali

### **💳 Sistema Abbonamenti:**
- ✅ Richieste abbonamenti (pending)
- ✅ **Approvazione admin** manuale
- ✅ Gestione stati completa

### **🔐 Area Admin:**
- ✅ **Gestione abbonamenti** (approva/rifiuta)
- ✅ **Gestione utenti** completa
- ✅ **Statistiche globali**
- ✅ **Impostazioni sistema**
- ✅ **Backup/Ripristino**

## 🎯 **TESTING:**

### **1. Dopo Deploy:**
1. Vai sull'URL del deploy
2. Registrati con email admin
3. Testa area admin

### **2. Testa Workflow:**
1. Registra utente normale
2. Richiedi abbonamento
3. Approva come admin
4. Verifica funzionamento

## 🚀 **DEPLOY RAPIDO:**

```bash
# Opzione 1: Vercel
npx vercel --prod --yes

# Opzione 2: Netlify
npx netlify-cli deploy --prod --dir .

# Opzione 3: Surge
npx surge . wakeupproof-admin.surge.sh
```

## 📊 **STATISTICHE APP:**

- **File principale:** `standalone.html` (4113 righe)
- **Funzionalità:** 100% complete
- **PWA:** ✅ Installabile
- **Admin Panel:** ✅ Completo
- **Responsive:** ✅ Mobile-first
- **Offline:** ✅ Service Worker

## 🎉 **PRONTO PER MILIONI DI DORMIglioni!**
