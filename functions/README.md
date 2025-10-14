# Firebase Functions — Stripe Webhook
Implementa endpoint `/stripe/webhook` che gestisce:
- invoice.payment_succeeded
- invoice.payment_failed

Aggiorna documento utente su Firestore con lo stato dell'abbonamento.
