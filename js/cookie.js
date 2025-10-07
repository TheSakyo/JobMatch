/**
 * CookieManager complet pour JobMatch
 * - Accept/Reject/Customize cookies
 * - Stockage local avec expiration 6 mois
 * - Bouton "Supprimer mes cookies"
 * - Accessibilité ARIA et navigation clavier
 */

class CookieManager {
    constructor() {
        this.STORAGE_KEY = 'cookiePreferences';
        this.EXPIRY_MONTHS = 6;
        this.ANIMATION_DURATION = 300;

        this.banner = document.getElementById('cookie-banner');
        this.settings = document.getElementById('cookie-settings');
        this.cookieContent = this.banner?.querySelector('.cookie-content');
        this.form = document.getElementById('cookiePreferencesForm');

        // Bind
        this.handleAcceptAll = this.handleAcceptAll.bind(this);
        this.handleRejectAll = this.handleRejectAll.bind(this);
        this.handleCustomize = this.handleCustomize.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.deletePreferences = this.deletePreferences.bind(this);

        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        if (!this.banner) return;

        if (this.hasValidPreferences()) {
            this.hideBanner();
            return;
        }

        // Buttons
        this.addClickListener('accept-all', this.handleAcceptAll);
        this.addClickListener('reject-all', this.handleRejectAll);
        this.addClickListener('customize', this.handleCustomize);
        this.addClickListener('back', this.handleBack);

        // Form
        if (this.form) this.form.addEventListener('submit', this.handleFormSubmit);

        // Delete button
        const deleteBtn = document.getElementById('delete-cookies');
        if (deleteBtn) deleteBtn.addEventListener('click', this.deletePreferences);

        // Keyboard
        document.addEventListener('keydown', this.handleKeyDown);

        this.showBanner();
        this.setupEventListeners();
    }

    addClickListener(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    hasValidPreferences() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return false;
            const data = JSON.parse(stored);
            if (!data.expiry) return false;
            return new Date(data.expiry) > new Date();
        } catch { return false; }
    }

    handleAcceptAll() { this.savePreferences({ essential:true, analytics:true, personalization:true, ads:true }); }
    handleRejectAll() { this.savePreferences({ essential:true, analytics:false, personalization:false, ads:false }); }

    handleCustomize() {
        if (!this.cookieContent || !this.settings) return;
        this.cookieContent.style.display = 'none';
        this.settings.classList.remove('hidden');
        this.settings.querySelector('h3')?.focus();
    }

    handleBack() {
        if (!this.cookieContent || !this.settings) return;
        this.settings.classList.add('hidden');
        this.cookieContent.style.display = 'block';
        document.getElementById('customize')?.focus();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        if (!this.form) return;
        const formData = new FormData(this.form);
        const prefs = {
            essential: true,
            analytics: formData.has('analytics'),
            personalization: formData.has('personalization'),
            ads: formData.has('ads')
        };
        this.savePreferences(prefs);
    }

    savePreferences(prefs) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + this.EXPIRY_MONTHS);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ prefs, expiry: expiry.toISOString() }));
        window.cookiePreferences = prefs;
        this.hideBanner();
        this.showToast('Vos préférences de cookies ont été sauvegardées.', 'success');
    }

    deletePreferences() {
        localStorage.removeItem(this.STORAGE_KEY);
        window.cookiePreferences = null;
        this.showBanner();
        this.showToast('Vos préférences de cookies ont été supprimées.', 'info');
    }

    handleKeyDown(e) {
        if (!this.isBannerVisible()) return;
        if (e.key === 'Escape') {
            if (this.settings && !this.settings.classList.contains('hidden')) this.handleBack();
            else this.handleRejectAll();
        }
    }

    showBanner() { if(this.banner){ this.banner.style.display='block'; this.banner.offsetHeight; this.banner.classList.add('visible'); } }
    hideBanner() { if(this.banner){ this.banner.style.opacity='0'; this.banner.style.transform='translateY(100%)'; setTimeout(()=>{ this.banner.style.display='none'; }, this.ANIMATION_DURATION); } }
    isBannerVisible() { return this.banner && this.banner.style.display !== 'none'; }

    showToast(message,type='info'){
        const toast=document.createElement('div');
        toast.className=`cookie-toast cookie-toast-${type}`;
        toast.setAttribute('role','alert');
        toast.setAttribute('aria-live','assertive');
        toast.textContent=message;
        Object.assign(toast.style,{
            position:'fixed',top:'20px',right:'20px',padding:'16px 24px',borderRadius:'8px',
            color:'white',fontWeight:'600',zIndex:'1001',opacity:'0',transform:'translateX(100%)',
            transition:'all 0.3s',maxWidth:'300px',wordWrap:'break-word'
        });
        const colors={success:'#28a745',error:'#dc3545',info:'#004aad'};
        toast.style.backgroundColor=colors[type]||colors.info;
        document.body.appendChild(toast);
        setTimeout(()=>{ toast.style.opacity='1'; toast.style.transform='translateX(0)'; },100);
        setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateX(100%)'; setTimeout(()=>{ toast.remove(); },300); },3000);
    }

    setupEventListeners() {
        // Ajout d'un écouteur global pour tous les boutons afin de masquer le popup.
        document.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                this.hideBanner();
            }
        });
    }
}

// Initialisation
window.cookieManager = new CookieManager();
