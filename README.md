# 🚨 WakeUpProof - La Sveglia Che Non Puoi Spegnere!

## 🎯 Cos'è WakeUpProof?

WakeUpProof è l'app anti-snooze definitiva che trasforma la tua mattina in una vittoria! Con challenge segrete random e suonerie personalizzate, non potrai più dormire troppo a lungo.

## ✨ Caratteristiche Principali

### 🎲 Challenge Segrete Random
- **50+ challenge diverse** che l'utente non può scegliere
- **Categorie**: Fisiche, Mentali, Creative, Sensoriali, Sociali, Estreme
- **Difficoltà variabile**: Easy, Medium, Hard, Extreme
- **Timer** per ogni challenge
- **Sistema di completamento** con feedback

### ⏰ Sistema Allarmi Avanzato
- **Orario personalizzabile** con giorni della settimana
- **Nome allarme** personalizzato
- **6 suonerie diverse**: Classica, Urgente, Natura, Elettronica, Motivazionale, Personalizzata
- **Generazione audio** client-side con Web Audio API

### ⚙️ Impostazioni Complete
- **Gestione profilo utente** completa
- **Sistema notifiche** personalizzabile
- **Privacy e sicurezza** configurabile
- **Sistema abbonamenti** Free/Pro/Premium
- **Backup/restore** dati utente

### 🎨 Design Accattivante
- **Material Design 3** con colori neon
- **Animazioni fluide** e transizioni
- **PWA completa** installabile
- **Responsive design** mobile-first
- **Dark theme** con effetti glow

## 🚀 Tecnologie Utilizzate

- **HTML5, CSS3, JavaScript** vanilla
- **Web Audio API** per suonerie
- **IndexedDB** per storage locale
- **Service Worker** per offline
- **Web Notifications** per allarmi
- **Camera API** per challenge foto
- **Sensors API** per contapassi

## 📱 Installazione

1. **Clona il repository**:
   ```bash
   git clone https://github.com/username/wakeup-proof.git
   cd wakeup-proof
   ```

2. **Apri l'app**:
   ```bash
   open standalone.html
   ```

3. **Installa come PWA**:
   - Apri in Chrome/Safari
   - Clicca "Aggiungi alla schermata home"
   - L'app sarà installata come app nativa

## 🎯 Come Funziona

1. **Crea un allarme** con orario e giorni
2. **Scegli una suoneria** personalizzata
3. **Quando suona**, appare una challenge segreta random
4. **Completa la challenge** per spegnere la sveglia
5. **Se salti**, appare una nuova challenge dopo 5 secondi

## 💳 Piani di Abbonamento

### 🆓 Free
- 3 allarmi base
- Challenge limitati
- Supporto email

### ⭐ Pro - €4.99/mese
- Allarmi illimitati
- Challenge avanzati
- Suonerie personalizzate
- Supporto prioritario

### 💎 Premium - €9.99/mese
- Tutto incluso
- Challenge estreme
- Analytics avanzate
- Supporto 24/7

## 🔧 Sviluppo

### Struttura Progetto
```
wakeup-proof/
├── standalone.html          # App principale PWA
├── index.html               # Redirect page
├── package.json             # Configurazione Node.js
├── vercel.json              # Configurazione Vercel
├── netlify.toml             # Configurazione Netlify
└── README.md                # Questo file
```

### Deploy
L'app è configurata per il deploy su:
- **Vercel** (raccomandato)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

## 🎨 Personalizzazione

### Colori
Modifica le variabili CSS in `standalone.html`:
```css
:root {
  --primary-color: #ff6b6b;
  --accent-color: #4ecdc4;
  --gradient-neon: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}
```

### Challenge
Aggiungi nuove challenge in `secretChallenges` array:
```javascript
{ id: 'new_challenge', name: 'Nuova Challenge', type: 'physical', difficulty: 'medium', icon: '🔥' }
```

## 📊 Analytics

L'app include:
- **Statistiche personali** (streak, challenge completati, efficacia)
- **Leaderboard globale** (in arrivo)
- **Condivisione social** con navigator.share
- **Export/import** dati utente

## 🔒 Privacy

- **Dati locali** salvati in localStorage
- **Nessun tracking** esterno
- **Analytics anonime** opzionali
- **GDPR compliant**

## 🐛 Bug Reports

Se trovi un bug, apri una issue su GitHub con:
- Descrizione del problema
- Passi per riprodurre
- Screenshot se necessario
- Browser e versione

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Fork del repository
2. Crea un branch per la feature
3. Commit delle modifiche
4. Push del branch
5. Apri una Pull Request

## 📄 Licenza

MIT License - vedi file LICENSE per dettagli

## 🎉 Ringraziamenti

- **Material Design 3** per il design system
- **Web Audio API** per le suonerie
- **PWA** per l'esperienza app-like
- **Tutti i dormiglioni** che ci hanno ispirato! 😴

---

**🚨 WakeUpProof - Trasforma la tua mattina in una vittoria! 🚀**