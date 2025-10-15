/**
 * Payment Service - Sistema di Pagamento WakeUpProof
 * Gestisce pagamenti, abbonamenti e fatturazione
 */

class PaymentService {
    constructor() {
        this.stripePublicKey = 'pk_test_51234567890abcdef'; // Chiave pubblica Stripe
        this.paypalClientId = 'sb-1234567890abcdef'; // Client ID PayPal
        this.products = this.initializeProducts();
        this.paymentMethods = ['stripe', 'paypal', 'apple_pay', 'google_pay'];
        this.currency = 'EUR';
        this.taxRate = 0.22; // IVA 22%
    }

    /**
     * Inizializza i prodotti disponibili
     */
    initializeProducts() {
        return {
            free: {
                id: 'free',
                name: 'Gratuito',
                price: 0,
                interval: 'month',
                features: [
                    '1 sveglia attiva',
                    'Challenge base',
                    'Statistiche limitate',
                    'Supporto email'
                ],
                limits: {
                    alarms: 1,
                    challenges: 5,
                    history: 7
                }
            },
            pro: {
                id: 'pro',
                name: 'Pro',
                price: 4.99,
                interval: 'month',
                features: [
                    'Sveglie illimitate',
                    'Challenge premium',
                    'Statistiche avanzate',
                    'Backup cloud',
                    'Supporto prioritario'
                ],
                limits: {
                    alarms: -1, // illimitato
                    challenges: -1,
                    history: 365
                }
            },
            premium: {
                id: 'premium',
                name: 'Premium',
                price: 9.99,
                interval: 'month',
                features: [
                    'Tutto Pro',
                    'Challenge esclusivi',
                    'Analisi AI',
                    'Integrazione smart home',
                    'Supporto 24/7',
                    'API access'
                ],
                limits: {
                    alarms: -1,
                    challenges: -1,
                    history: -1
                }
            },
            annual_pro: {
                id: 'annual_pro',
                name: 'Pro Annuale',
                price: 49.99,
                interval: 'year',
                features: [
                    'Tutto Pro',
                    'Risparmio 2 mesi',
                    'Challenge esclusivi',
                    'Supporto prioritario'
                ],
                limits: {
                    alarms: -1,
                    challenges: -1,
                    history: 365
                }
            },
            annual_premium: {
                id: 'annual_premium',
                name: 'Premium Annuale',
                price: 99.99,
                interval: 'year',
                features: [
                    'Tutto Premium',
                    'Risparmio 2 mesi',
                    'Challenge esclusivi',
                    'Analisi AI avanzata',
                    'Supporto 24/7'
                ],
                limits: {
                    alarms: -1,
                    challenges: -1,
                    history: -1
                }
            }
        };
    }

    /**
     * Ottiene i dettagli di un prodotto
     */
    getProduct(productId) {
        return this.products[productId] || null;
    }

    /**
     * Calcola il prezzo con IVA
     */
    calculatePrice(productId, quantity = 1) {
        const product = this.getProduct(productId);
        if (!product) return null;

        const basePrice = product.price * quantity;
        const tax = basePrice * this.taxRate;
        const total = basePrice + tax;

        return {
            basePrice: basePrice,
            tax: tax,
            total: total,
            currency: this.currency,
            product: product
        };
    }

    /**
     * Crea una sessione di pagamento Stripe
     */
    async createStripeSession(productId, userId, successUrl, cancelUrl) {
        try {
            const product = this.getProduct(productId);
            if (!product) throw new Error('Prodotto non trovato');

            const price = this.calculatePrice(productId);
            
            // Simula chiamata API Stripe
            const sessionData = {
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: this.currency,
                        product_data: {
                            name: product.name,
                            description: product.features.join(', ')
                        },
                        unit_amount: Math.round(price.basePrice * 100) // Stripe usa centesimi
                    },
                    quantity: 1
                }],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: this.getUserEmail(userId),
                metadata: {
                    user_id: userId,
                    product_id: productId
                }
            };

            // Simula risposta Stripe
            return {
                id: 'cs_test_' + Date.now(),
                url: 'https://checkout.stripe.com/c/pay/cs_test_' + Date.now(),
                sessionData: sessionData
            };
        } catch (error) {
            console.error('Errore creazione sessione Stripe:', error);
            throw error;
        }
    }

    /**
     * Crea un ordine PayPal
     */
    async createPayPalOrder(productId, userId) {
        try {
            const product = this.getProduct(productId);
            if (!product) throw new Error('Prodotto non trovato');

            const price = this.calculatePrice(productId);
            
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: this.currency,
                        value: price.total.toFixed(2)
                    },
                    description: product.name
                }],
                application_context: {
                    brand_name: 'WakeUpProof',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW'
                }
            };

            // Simula risposta PayPal
            return {
                id: 'PAYPAL_ORDER_' + Date.now(),
                orderData: orderData
            };
        } catch (error) {
            console.error('Errore creazione ordine PayPal:', error);
            throw error;
        }
    }

    /**
     * Processa un pagamento
     */
    async processPayment(paymentData) {
        try {
            const { method, productId, userId, paymentDetails } = paymentData;
            
            // Simula elaborazione pagamento
            const result = await this.simulatePayment(method, paymentDetails);
            
            if (result.success) {
                // Aggiorna abbonamento utente
                await this.updateUserSubscription(userId, productId, result.transactionId);
                
                // Invia conferma email
                await this.sendPaymentConfirmation(userId, productId, result);
                
                return {
                    success: true,
                    transactionId: result.transactionId,
                    subscriptionId: result.subscriptionId,
                    message: 'Pagamento completato con successo!'
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Errore elaborazione pagamento:', error);
            throw error;
        }
    }

    /**
     * Simula elaborazione pagamento
     */
    async simulatePayment(method, details) {
        // Simula delay di rete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simula successo/fallimento casuale (90% successo)
        const success = Math.random() > 0.1;
        
        if (success) {
            return {
                success: true,
                transactionId: 'TXN_' + Date.now(),
                subscriptionId: 'SUB_' + Date.now(),
                amount: details.amount,
                currency: this.currency,
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                success: false,
                error: 'Pagamento rifiutato dalla banca'
            };
        }
    }

    /**
     * Aggiorna abbonamento utente
     */
    async updateUserSubscription(userId, productId, transactionId) {
        try {
            const user = this.getUserData(userId);
            const product = this.getProduct(productId);
            
            if (!user || !product) {
                throw new Error('Utente o prodotto non trovato');
            }

            const subscription = {
                id: 'SUB_' + Date.now(),
                productId: productId,
                productName: product.name,
                price: product.price,
                interval: product.interval,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: this.calculateEndDate(product.interval),
                transactionId: transactionId,
                autoRenew: true
            };

            // Aggiorna dati utente
            user.subscription = subscription;
            user.subscriptionHistory = user.subscriptionHistory || [];
            user.subscriptionHistory.push(subscription);

            // Salva dati
            this.saveUserData(userId, user);
            
            // Aggiorna statistiche
            this.updatePaymentStats(productId, product.price);
            
            return subscription;
        } catch (error) {
            console.error('Errore aggiornamento abbonamento:', error);
            throw error;
        }
    }

    /**
     * Calcola data di scadenza abbonamento
     */
    calculateEndDate(interval) {
        const now = new Date();
        if (interval === 'month') {
            now.setMonth(now.getMonth() + 1);
        } else if (interval === 'year') {
            now.setFullYear(now.getFullYear() + 1);
        }
        return now.toISOString();
    }

    /**
     * Invia conferma pagamento
     */
    async sendPaymentConfirmation(userId, productId, paymentResult) {
        try {
            const user = this.getUserData(userId);
            const product = this.getProduct(productId);
            
            if (!user || !product) return;

            const emailData = {
                to: user.email,
                subject: 'Conferma Pagamento WakeUpProof',
                template: 'payment_confirmation',
                data: {
                    userName: user.name,
                    productName: product.name,
                    amount: product.price,
                    currency: this.currency,
                    transactionId: paymentResult.transactionId,
                    features: product.features
                }
            };

            // Simula invio email
            console.log('Email inviata:', emailData);
            return true;
        } catch (error) {
            console.error('Errore invio email:', error);
            return false;
        }
    }

    /**
     * Gestisce webhook di pagamento
     */
    async handlePaymentWebhook(webhookData) {
        try {
            const { event, data } = webhookData;
            
            switch (event) {
                case 'payment.succeeded':
                    await this.handlePaymentSuccess(data);
                    break;
                case 'payment.failed':
                    await this.handlePaymentFailure(data);
                    break;
                case 'subscription.cancelled':
                    await this.handleSubscriptionCancellation(data);
                    break;
                case 'subscription.updated':
                    await this.handleSubscriptionUpdate(data);
                    break;
                default:
                    console.log('Webhook non gestito:', event);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Errore gestione webhook:', error);
            throw error;
        }
    }

    /**
     * Gestisce successo pagamento
     */
    async handlePaymentSuccess(data) {
        const { userId, productId, transactionId } = data;
        await this.updateUserSubscription(userId, productId, transactionId);
    }

    /**
     * Gestisce fallimento pagamento
     */
    async handlePaymentFailure(data) {
        const { userId, productId, error } = data;
        console.log(`Pagamento fallito per utente ${userId}: ${error}`);
        // Invia notifica all'utente
    }

    /**
     * Gestisce cancellazione abbonamento
     */
    async handleSubscriptionCancellation(data) {
        const { userId, subscriptionId } = data;
        const user = this.getUserData(userId);
        if (user && user.subscription) {
            user.subscription.status = 'cancelled';
            user.subscription.cancelledAt = new Date().toISOString();
            this.saveUserData(userId, user);
        }
    }

    /**
     * Gestisce aggiornamento abbonamento
     */
    async handleSubscriptionUpdate(data) {
        const { userId, newProductId } = data;
        await this.updateUserSubscription(userId, newProductId, 'UPDATE_' + Date.now());
    }

    /**
     * Ottiene statistiche pagamenti
     */
    getPaymentStats() {
        const stats = JSON.parse(localStorage.getItem('paymentStats') || '{}');
        return {
            totalRevenue: stats.totalRevenue || 0,
            totalTransactions: stats.totalTransactions || 0,
            activeSubscriptions: stats.activeSubscriptions || 0,
            monthlyRevenue: stats.monthlyRevenue || 0,
            topProduct: stats.topProduct || 'free'
        };
    }

    /**
     * Aggiorna statistiche pagamenti
     */
    updatePaymentStats(productId, amount) {
        const stats = this.getPaymentStats();
        stats.totalRevenue += amount;
        stats.totalTransactions += 1;
        stats.monthlyRevenue += amount;
        stats.topProduct = productId;
        
        localStorage.setItem('paymentStats', JSON.stringify(stats));
    }

    /**
     * Ottiene dati utente
     */
    getUserData(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return users[userId] || null;
    }

    /**
     * Salva dati utente
     */
    saveUserData(userId, userData) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[userId] = userData;
        localStorage.setItem('users', JSON.stringify(users));
    }

    /**
     * Ottiene email utente
     */
    getUserEmail(userId) {
        const user = this.getUserData(userId);
        return user ? user.email : null;
    }

    /**
     * Genera fattura
     */
    generateInvoice(transactionId, userId) {
        try {
            const user = this.getUserData(userId);
            const subscription = user ? user.subscription : null;
            
            if (!subscription) {
                throw new Error('Abbonamento non trovato');
            }

            const invoice = {
                id: 'INV_' + Date.now(),
                transactionId: transactionId,
                userId: userId,
                userName: user.name,
                userEmail: user.email,
                productName: subscription.productName,
                amount: subscription.price,
                tax: subscription.price * this.taxRate,
                total: subscription.price + (subscription.price * this.taxRate),
                currency: this.currency,
                date: new Date().toISOString(),
                status: 'paid'
            };

            // Salva fattura
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            invoices.push(invoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));

            return invoice;
        } catch (error) {
            console.error('Errore generazione fattura:', error);
            throw error;
        }
    }

    /**
     * Ottiene fatture utente
     */
    getUserInvoices(userId) {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        return invoices.filter(invoice => invoice.userId === userId);
    }

    /**
     * Gestisce rimborso
     */
    async processRefund(transactionId, amount, reason) {
        try {
            // Simula elaborazione rimborso
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const refund = {
                id: 'REF_' + Date.now(),
                transactionId: transactionId,
                amount: amount,
                reason: reason,
                status: 'processed',
                date: new Date().toISOString()
            };

            // Salva rimborso
            const refunds = JSON.parse(localStorage.getItem('refunds') || '[]');
            refunds.push(refund);
            localStorage.setItem('refunds', JSON.stringify(refunds));

            return refund;
        } catch (error) {
            console.error('Errore elaborazione rimborso:', error);
            throw error;
        }
    }
}

// Esporta per uso globale
window.PaymentService = PaymentService;
