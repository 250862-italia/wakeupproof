# 🚨 WakeUpProof — Anti‑Snooze Alarm App (MVP)

App mobile **a prova di scuse**: la sveglia **non si spegne** finché non completi una sfida reale verificata **on‑device** (NFC/QR in bagno, passi reali, foto del lavabo).  
Modello **in abbonamento**: Free / Pro / Premium. Nessuna foto inviata al cloud per impostazione predefinita.

---

## 🎯 Visione
Creare la prima sveglia che combina **ML on‑device**, **challenge fisici** e **anti‑cheat serio**.  
Promessa: se non fai l’azione giusta **ogni 30s** l’allarme rilancia.

---

## 🧠 Architettura (v1.0)
**Stack**
- **App:** Flutter 3.x (Dart)
- **ML/Vision:** MobileCLIP (ONNX quantizzato) + MLKit/CoreML (scanner/visione leggera)
- **Backend SaaS:** Firebase (Auth, Firestore, Functions per Stripe webhooks)
- **Pagamenti:** Stripe Billing (portal + webhook)
- **Storage locale:** SQLite cifrato (SQLCipher)
- **Analytics:** on‑device → export anonimo (opt‑in)
- **CI/CD:** GitHub Actions + Cursor

**Moduli**
```
/lib
  /core
    /alarm_engine/
    /challenge_engine/
      /photo/
      /nfc_qr/
      /steps/
  /data
    /db/
    /models/
    /subscription/
  /ml/onnx/
  /ui
    /screens/
    /widgets/
```

---

## ⚙️ Funzionalità Core
1) **Allarmi affidabili**
   - Android: `SCHEDULE_EXACT_ALARM`, Foreground Service, `WAKE_LOCK`
   - iOS: Local Notifications + richiesta Critical Alerts (fallback pronto)
2) **Challenge Engine**
   - **NFC/QR**: sticker in bagno (QR firmato dall’app / NFC UID whitelist)
   - **Passi**: >120 in 2 minuti + cambio beacon Wi‑Fi/Bluetooth
   - **Foto bagno**: confronto embedding con **template serale** + liveness (“mano in foto”)
3) **Loop 30s**
   - Mancato superamento → nuovo suono ogni 30s, escalation volume/vibrazione
4) **Anti‑cheat**
   - Randomizzazione task, EXIF/luminosità diverse, angolo obbligato
   - Catena sfide se sospetto (es. Foto → NFC)
5) **Privacy**
   - Foto ed embedding **cifrati on‑device**; **auto‑delete** 24/72h (default 24h)
6) **Abbonamenti**
   - Free → 1 sveglia, 2 task
   - Pro → 5 sveglie, 100 task, NFC/QR, report
   - Premium → task personalizzati, statistiche storiche, coaching

---

## 💳 Abbonamenti (Stripe)
Webhook chiave:
- `invoice.payment_succeeded` → `subscription.active=true`
- `invoice.payment_failed` → downgrade a Free

Endpoint suggerito (Firebase Functions): `/stripe/webhook`

Variabili richieste:
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FIREBASE_PROJECT_ID=
```

---

## 🔐 Sicurezza
- SQLite + SQLCipher, chiavi in Keychain/Keystore
- QR firmati **ECDSA** generati all’installazione (no screenshot reuse)
- NFC: whitelisting UID
- GDPR‑ready: data minimization, portabilità su richiesta (report .zip locale)

---

## 🚀 Setup Dev (con Cursor)
1. **Prerequisiti:** Flutter 3.x, Dart SDK, Android Studio/Xcode, Firebase CLI  
2. **Clona il repo:**
   ```bash
   git clone <repo> wakeup-proof && cd wakeup-proof
   ```
3. **Dipendenze:**
   ```bash
   flutter pub get
   ```
4. **Firebase:**
   - Crea progetto, scarica `google-services.json` e `GoogleService-Info.plist`
   - Posizionali in `/android/app` e `/ios/Runner`
5. **Stripe:**
   - Crea prodotto + prezzi (Free/Pro/Premium)
   - Imposta webhook → `/stripe/webhook`
   - Popola `.env` (vedi `.env.example`)
6. **Run locale:**
   ```bash
   flutter run
   ```

> **Nota piattaforma:** su iOS l’uso di **Critical Alerts** è soggetto ad approvazione Apple. È già previsto un **fallback** (notifica + suono + vibrazioni + schermata lock).

---

## 🧪 Test & KPI
- **Affidabilità allarme:** 7 giorni, 5 orari casuali (battery saver ON/OFF)
- **Anti‑cheat:** screenshot QR, foto vecchie, oscillazioni → devono fallire
- **KPI MVP:** Crash‑free ≥ 99.5% • Success rate ≥ 90% • TtW mediano < 90s

---

## 📦 Struttura pacchetto
- `pubspec.yaml` con dipendenze suggerite
- `lib/main.dart` (bootstrap app)
- Skeleton di `alarm_engine`, `challenge_engine`, `subscription_service`
- Schema SQL iniziale (SQLCipher)
- Workflow GitHub Actions per build/check
- `INIT.md` con comandi “flutter create” lato piattaforma

---

## 📈 Roadmap (4 sprint)
- S1: scheduler & loop 30s + storage locale
- S2: challenge NFC/QR + passi + foto (base)
- S3: anti‑cheat PRO + UX onboarding
- S4: beta (TestFlight/Closed Track) + metriche

---

## 🤝 Contributi
PR con issue collegata. Stile pulito, test inclusi, niente tracking invasivo.

## 📄 Licenza
Proprietaria © 2025 — Magnificus Dominus Consulting Europe Srl. Tutti i diritti riservati.
