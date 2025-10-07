/**
 * JobMatch Premium Page Script
 * Handles subscription plan selection, payment form validation, and simulation
 */

class PremiumManager {
    constructor() {
        // Plan configurations.
        this.plans = {
            candidat: {
                name: 'Candidat Premium',
                monthly: 9.99,
                annual: 99
            },
            recruteur: {
                name: 'Recruteur Premium',
                monthly: 29.99,
                annual: 299
            },
            entreprise: {
                name: 'Entreprise',
                monthly: null,
                annual: null
            }
        };
        
        this.selectedPlan = null;
        this.selectedCycle = 'monthly';
        
        // Bind methods.
        this.handleBillingCycleChange = this.handleBillingCycleChange.bind(this);
        this.handlePaymentMethodChange = this.handlePaymentMethodChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        
        this.init();
    }
    
    /**
     * Initialize the premium manager.
     */
    init() {
        try {
            this.setupEventListeners();
            this.setupFormValidation();
            this.setupCardFormatting();
            
            console.log('Premium manager initialized successfully.');
        } catch (error) {
            console.error('Error initializing premium manager:', error);
        }
    }
    
    /**
     * Setup event listeners.
     */
    setupEventListeners() {
        // Billing cycle change.
        const billingRadios = document.querySelectorAll('input[name="billing-cycle"]');
        billingRadios.forEach(radio => {
            radio.addEventListener('change', this.handleBillingCycleChange);
        });
        
        // Payment method change.
        const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', this.handlePaymentMethodChange);
        });
        
        // Form submission.
        const form = document.getElementById('premium-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }
    }
    
    /**
     * Setup form validation.
     */
    setupFormValidation() {
        // Real-time validation for specific fields.
        const siretField = document.getElementById('billing-siret');
        if (siretField) {
            siretField.addEventListener('input', this.validateSiret.bind(this));
        }
        
        const emailField = document.getElementById('billing-email');
        if (emailField) {
            emailField.addEventListener('blur', this.validateEmail.bind(this));
        }
        
        const postalField = document.getElementById('billing-postal');
        if (postalField) {
            postalField.addEventListener('input', this.validatePostalCode.bind(this));
        }
    }
    
    /**
     * Setup card number formatting.
     */
    setupCardFormatting() {
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', this.formatCardNumber.bind(this));
        }
        
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', this.formatCardExpiry.bind(this));
        }
        
        const cardCvv = document.getElementById('card-cvv');
        if (cardCvv) {
            cardCvv.addEventListener('input', this.formatCvv.bind(this));
        }
    }
    
    /**
     * Handle billing cycle change.
     */
    handleBillingCycleChange(event) {
        this.selectedCycle = event.target.value;
        this.updatePricing();
    }
    
    /**
     * Handle payment method change.
     */
    handlePaymentMethodChange(event) {
        const cardDetails = document.getElementById('card-details');
        if (cardDetails) {
            if (event.target.value === 'card') {
                cardDetails.style.display = 'block';
                this.setCardFieldsRequired(true);
            } else {
                cardDetails.style.display = 'none';
                this.setCardFieldsRequired(false);
            }
        }
    }
    
    /**
     * Set card fields as required or not.
     */
    setCardFieldsRequired(required) {
        const cardFields = ['card-number', 'card-expiry', 'card-cvv'];
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (required) {
                    field.setAttribute('required', '');
                } else {
                    field.removeAttribute('required');
                }
            }
        });
    }
    
    /**
     * Handle form submission.
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.validateForm()) {
            this.processPayment();
        }
    }
    
    /**
     * Validate the entire form.
     */
    validateForm() {
        let isValid = true;
        const errors = [];
        
        // Check required fields.
        const requiredFields = document.querySelectorAll('#premium-form [required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'Ce champ est obligatoire.');
                errors.push(`${field.labels?.[0]?.textContent || field.name} est obligatoire`);
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Validate specific fields.
        if (!this.validateEmailField()) isValid = false;
        if (!this.validateSiretField()) isValid = false;
        if (!this.validateCardFields()) isValid = false;
        
        if (!isValid) {
            alert('Veuillez corriger les erreurs dans le formulaire avant de continuer.');
        }
        
        return isValid;
    }
    
    /**
     * Validate email field.
     */
    validateEmailField() {
        const email = document.getElementById('billing-email');
        if (!email || !email.value) return true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            this.showFieldError(email, 'Adresse email invalide.');
            return false;
        }
        
        this.clearFieldError(email);
        return true;
    }
    
    /**
     * Validate SIRET field.
     */
    validateSiretField() {
        const siret = document.getElementById('billing-siret');
        if (!siret || !siret.value) return true;
        
        const siretRegex = /^[0-9]{14}$/;
        if (!siretRegex.test(siret.value)) {
            this.showFieldError(siret, 'Le numéro SIRET doit contenir exactement 14 chiffres.');
            return false;
        }
        
        this.clearFieldError(siret);
        return true;
    }
    
    /**
     * Validate card fields.
     */
    validateCardFields() {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod || paymentMethod.value !== 'card') return true;
        
        let isValid = true;
        
        // Card number validation.
        const cardNumber = document.getElementById('card-number');
        if (cardNumber && cardNumber.value) {
            const cleanNumber = cardNumber.value.replace(/\s/g, '');
            if (!/^[0-9]{13,19}$/.test(cleanNumber)) {
                this.showFieldError(cardNumber, 'Numéro de carte invalide.');
                isValid = false;
            } else {
                this.clearFieldError(cardNumber);
            }
        }
        
        // Expiry validation.
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry && cardExpiry.value) {
            const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
            if (!expiryRegex.test(cardExpiry.value)) {
                this.showFieldError(cardExpiry, 'Format invalide (MM/AA).');
                isValid = false;
            } else {
                // Check if not expired.
                const [month, year] = cardExpiry.value.split('/');
                const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
                const now = new Date();
                
                if (expiry < now) {
                    this.showFieldError(cardExpiry, 'Carte expirée.');
                    isValid = false;
                } else {
                    this.clearFieldError(cardExpiry);
                }
            }
        }
        
        // CVV validation.
        const cardCvv = document.getElementById('card-cvv');
        if (cardCvv && cardCvv.value) {
            if (!/^[0-9]{3,4}$/.test(cardCvv.value)) {
                this.showFieldError(cardCvv, 'CVV invalide (3 ou 4 chiffres).');
                isValid = false;
            } else {
                this.clearFieldError(cardCvv);
            }
        }
        
        return isValid;
    }
    
    /**
     * Show field error.
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    /**
     * Clear field error.
     */
    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    /**
     * Format card number input.
     */
    formatCardNumber(event) {
        let value = event.target.value.replace(/\s/g, '');
        let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substring(0, 19);
        }
        
        event.target.value = formattedValue;
    }
    
    /**
     * Format card expiry input.
     */
    formatCardExpiry(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        event.target.value = value;
    }
    
    /**
     * Format CVV input.
     */
    formatCvv(event) {
        let value = event.target.value.replace(/\D/g, '');
        event.target.value = value.substring(0, 4);
    }
    
    /**
     * Validate individual fields on blur.
     */
    validateSiret(event) {
        this.validateSiretField();
    }
    
    validateEmail(event) {
        this.validateEmailField();
    }
    
    validatePostalCode(event) {
        const postal = event.target;
        const country = document.getElementById('billing-country');
        
        if (country && country.value === 'FR') {
            const frenchPostalRegex = /^[0-9]{5}$/;
            if (postal.value && !frenchPostalRegex.test(postal.value)) {
                this.showFieldError(postal, 'Code postal français invalide (5 chiffres).');
            } else {
                this.clearFieldError(postal);
            }
        }
    }
    
    /**
     * Update pricing display.
     */
    updatePricing() {
        if (!this.selectedPlan) return;
        
        const plan = this.plans[this.selectedPlan];
        if (!plan) return;
        
        const price = this.selectedCycle === 'annual' ? plan.annual : plan.monthly;
        const currency = '€';
        
        document.getElementById('selected-plan-price').textContent = `${price}${currency}`;
        document.getElementById('total-amount').textContent = `${price}${currency}`;
        
        const duration = this.selectedCycle === 'annual' ? 'Annuel' : 'Mensuel';
        document.getElementById('selected-plan-duration').textContent = duration;
    }
    
    /**
     * Process payment simulation.
     */
    async processPayment() {
        const submitBtn = document.querySelector('#premium-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state.
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Traitement en cours...';
            
            // Simulate payment processing.
            await this.simulatePaymentProcessing();
            
            // Success.
            this.showPaymentSuccess();
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showPaymentError(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    /**
     * Simulate payment processing.
     */
    simulatePaymentProcessing() {
        return new Promise((resolve, reject) => {
            // Random success/failure for simulation.
            const random = Math.random();
            
            setTimeout(() => {
                if (random > 0.1) { // 90% success rate.
                    resolve();
                } else {
                    reject(new Error('Paiement refusé par votre banque.'));
                }
            }, 2000);
        });
    }
    
    /**
     * Show payment success.
     */
    showPaymentSuccess() {
        const plan = this.plans[this.selectedPlan];
        const price = this.selectedCycle === 'annual' ? plan.annual : plan.monthly;
        const duration = this.selectedCycle === 'annual' ? 'an' : 'mois';
        
        alert(`🎉 Félicitations ! Votre abonnement ${plan.name} (${price}€/${duration}) a été activé avec succès.\n\nVous allez recevoir un email de confirmation avec votre facture.\n\nVous pouvez maintenant profiter de toutes les fonctionnalités Premium !`);
        
        // Simulate redirect to profile.
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    }
    
    /**
     * Show payment error.
     */
    showPaymentError(message) {
        alert(`❌ Erreur de paiement\n\n${message}\n\nVeuillez réessayer ou contactez votre banque.`);
    }
}

/**
 * Global functions for plan selection.
 */
window.selectPlan = function(planType, cycle = 'monthly') {
    const premiumManager = window.premiumManager;
    if (!premiumManager) return;
    
    premiumManager.selectedPlan = planType;
    premiumManager.selectedCycle = cycle;
    
    // Update form fields.
    document.getElementById('selected-plan-type').value = planType;
    document.getElementById('selected-billing-cycle').value = cycle;
    
    // Update display.
    const plan = premiumManager.plans[planType];
    document.getElementById('selected-plan-name').textContent = plan.name;
    
    // Show/hide SIRET field for recruiters.
    const siretGroup = document.getElementById('siret-group');
    if (siretGroup) {
        if (planType === 'recruteur' || planType === 'entreprise') {
            siretGroup.style.display = 'block';
        } else {
            siretGroup.style.display = 'none';
        }
    }
    
    // Update billing cycle radio.
    const cycleRadio = document.querySelector(`input[name="billing-cycle"][value="${cycle}"]`);
    if (cycleRadio) {
        cycleRadio.checked = true;
    }
    
    premiumManager.updatePricing();
    
    // Show payment section.
    document.getElementById('payment-section').style.display = 'block';
    
    // Scroll to payment section.
    document.getElementById('payment-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
};

window.contactSales = function() {
    alert('🏢 Pour un devis Entreprise personnalisé :\n\n📧 Email : sales@jobmatch.fr\n📞 Téléphone : 05 56 XX XX XX\n\nNotre équipe commerciale vous contactera sous 24h pour étudier vos besoins et vous proposer une solution sur mesure.');
};

window.goBack = function() {
    document.getElementById('payment-section').style.display = 'none';
    document.querySelector('.pricing-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
};

/**
 * FAQ toggle function.
 */
window.toggleFaq = function(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('span');
    
    if (answer.classList.contains('active')) {
        answer.classList.remove('active');
        icon.textContent = '+';
    } else {
        // Close all other answers.
        document.querySelectorAll('.faq-answer.active').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.faq-question span').forEach(span => {
            span.textContent = '+';
        });
        
        // Open clicked answer.
        answer.classList.add('active');
        icon.textContent = '-';
    }
};

// Initialize premium manager on DOM load.
document.addEventListener('DOMContentLoaded', () => {
    window.premiumManager = new PremiumManager();
});
