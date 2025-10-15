# INIT — Istruzioni iniziali piattaforme

Questo boilerplate **non** include le cartelle native Android/iOS generate da Flutter.
Dopo l’unzip esegui:

```bash
flutter create .
flutter pub get
```

Poi inserisci:
- `android/app/google-services.json`
- `ios/Runner/GoogleService-Info.plist`

Abilita permessi:
- **Android**: `SCHEDULE_EXACT_ALARM`, `WAKE_LOCK`, foreground service, camera, NFC, Bluetooth
- **iOS**: notifiche locali, camera, NFC (se supportato), Bluetooth. Richiedi *Critical Alerts* se intendi usarle.

Stripe webhook: implementa in **Firebase Functions** (cartella `/functions`) l’endpoint `/stripe/webhook`.
