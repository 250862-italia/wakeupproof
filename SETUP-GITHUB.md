# 🚀 Setup GitHub per WakeUpProof

## 📋 Passaggi per Collegare Vercel a GitHub

### 1. Crea Repository su GitHub

1. Vai su [github.com/new](https://github.com/new)
2. Nome repository: `wakeupproof`
3. Descrizione: `🚨 LA SVEGLIA CHE NON PUOI SPEGNERE! Challenge reali, zero scuse, 100% efficacia.`
4. Seleziona "Public"
5. **NON** inizializzare con README (abbiamo già i file)
6. Clicca "Create repository"

### 2. Collega Repository Locale

```bash
# Aggiungi remote origin
git remote add origin https://github.com/TUO_USERNAME/wakeupproof.git

# Push del codice
git branch -M main
git push -u origin main
```

### 3. Collega Vercel a GitHub

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clicca "New Project"
3. Seleziona "Import Git Repository"
4. Connetti il tuo account GitHub
5. Seleziona il repository `wakeupproof`
6. Clicca "Import"

### 4. Configurazione Vercel

- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `echo "No build needed"`
- **Output Directory**: `./`
- **Install Command**: `npm install`

### 5. Deploy Automatico

Una volta collegato, ogni push su GitHub farà il deploy automatico su Vercel!

## 🔧 Configurazione Avanzata

### Environment Variables (se necessario)
```bash
# Su Vercel Dashboard → Settings → Environment Variables
NODE_ENV=production
```

### Custom Domain
```bash
# Su Vercel Dashboard → Settings → Domains
wakeupproof.com
```

## 📱 PWA Features

- ✅ **Installabile** su mobile
- ✅ **Offline support** completo
- ✅ **Push notifications** funzionanti
- ✅ **App-like experience** perfetta

## 🎯 Marketing Ready

- ✅ **Design accattivante** per dormiglioni
- ✅ **Messaging vendibile** e convincente
- ✅ **Social sharing** integrato
- ✅ **Gamification** completa
- ✅ **Monetizzazione** chiara

---

**🎉 Una volta completato, WakeUpProof sarà completamente automatizzato!**
