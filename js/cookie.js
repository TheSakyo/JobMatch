/**
 * JobMatch+ Cookie Management System
 * Modern, accessible, and GDPR-compliant cookie banner
 * 
 * Features:
 * - GDPR compliance with granular control.
 * - Accessibility support (ARIA, keyboard navigation).
 * - Local storage with expiration handling.
 * - Error handling and fallbacks.
 * - Event delegation for better performance.
 */

class CookieManager {
  constructor() {
    // Configuration constants.
    this.STORAGE_KEY = 'cookiePreferences';
    this.EXPIRY_MONTHS = 6;
    this.ANIMATION_DURATION = 300;
    
    // DOM elements.
    this.banner = null;
    this.settings = null;
    this.cookieContent = null;
    this.form = null;
    
    // Bind methods to maintain context.
    this.handleAcceptAll = this.handleAcceptAll.bind(this);
    this.handleRejectAll = this.handleRejectAll.bind(this);
    this.handleCustomize = this.handleCustomize.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    this.init();
  }
  
  /**
   * Initialize the cookie manager.
   */
  init() {
    try {
      this.initDOM();
      
      if (!this.banner) {
        console.warn('Cookie banner not found. Make sure the HTML is loaded.');
        return;
      }
      
      // Check existing preferences.
      if (this.hasValidPreferences()) {
        this.hideBanner();
        return;
      }
      
      this.setupEventListeners();
      this.setupAccessibility();
      this.showBanner();
      
    } catch (error) {
      console.error('Error initializing cookie manager:', error);
    }
  }
  
  /**
   * Initialize DOM references.
   */
  initDOM() {
    this.banner = document.getElementById('cookie-banner');
    this.settings = document.getElementById('cookie-settings');
    this.cookieContent = this.banner?.querySelector('.cookie-content');
    this.form = document.getElementById('cookiePreferencesForm');
  }
  
  /**
   * Set up event listeners with error handling.
   */
  setupEventListeners() {
    // Main action buttons.
    this.addClickListener('accept-all', this.handleAcceptAll);
    this.addClickListener('reject-all', this.handleRejectAll);
    this.addClickListener('customize', this.handleCustomize);
    this.addClickListener('back', this.handleBack);
    
    // Form submission.
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit);
    }
    
    // Keyboard navigation.
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Ajout d'un écouteur global pour tous les boutons afin de masquer le popup.
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        this.hideBanner();
      }
    });
  }
  
  /**
   * Add click listener with error handling.
   */
  addClickListener(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', handler);
    } else {
      console.warn(`Element with ID '${elementId}' not found.`);
    }
  }
  
  /**
   * Setup accessibility features.
   */
  setupAccessibility() {
    if (this.banner) {
      // Ensure banner is focusable and announced.
      this.banner.setAttribute('tabindex', '-1');
      this.banner.focus();
      
      // Add live region for screen readers.
      this.banner.setAttribute('aria-live', 'polite');
    }
  }
  
  /**
   * Handle keyboard navigation.
   */
  handleKeyDown(event) {
    if (!this.isBannerVisible()) return;
    
    if (event.key === 'Escape') {
      if (this.isSettingsVisible()) {
        this.handleBack();
      } else {
        // ESC closes banner with essential cookies only.
        this.handleRejectAll();
      }
    }
  }
  
  /**
   * Check if valid preferences exist.
   */
  hasValidPreferences() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.expiry || !data.prefs) return false;
      
      // Check if preferences have expired.
      const expiryDate = new Date(data.expiry);
      const now = new Date();
      
      return expiryDate > now;
      
    } catch (error) {
      console.warn('Error reading cookie preferences:', error);
      return false;
    }
  }
  
  /**
   * Handle accept all cookies.
   */
  handleAcceptAll() {
    const preferences = {
      essential: true,
      analytics: true,
      personalization: true,
      ads: true,
      timestamp: new Date().toISOString()
    };
    
    this.savePreferences(preferences);
    this.trackConsentChoice('accept_all');
  }
  
  /**
   * Handle reject optional cookies.
   */
  handleRejectAll() {
    const preferences = {
      essential: true, // Always required.
      analytics: false,
      personalization: false,
      ads: false,
      timestamp: new Date().toISOString()
    };
    
    this.savePreferences(preferences);
    this.trackConsentChoice('reject_all');
  }
  
  /**
   * Show customization settings.
   */
  handleCustomize() {
    if (!this.cookieContent || !this.settings) {
      console.error('Cookie content or settings element not found.');
      return;
    }
    
    // Hide main content with animation.
    this.cookieContent.style.opacity = '0';
    this.cookieContent.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      this.cookieContent.style.display = 'none';
      this.settings.classList.remove('hidden');
      
      // Focus on settings title for accessibility.
      const settingsTitle = this.settings.querySelector('h3');
      if (settingsTitle) {
        settingsTitle.focus();
      }
    }, this.ANIMATION_DURATION);
    
    this.trackConsentChoice('customize_open');
  }
  
  /**
   * Return to main banner from settings.
   */
  handleBack() {
    if (!this.cookieContent || !this.settings) return;
    
    this.settings.classList.add('hidden');
    
    setTimeout(() => {
      this.cookieContent.style.display = 'block';
      this.cookieContent.style.opacity = '1';
      this.cookieContent.style.transform = 'translateY(0)';
      
      // Focus on customize button.
      const customizeButton = document.getElementById('customize');
      if (customizeButton) {
        customizeButton.focus();
      }
    }, 100);
  }
  
  /**
   * Handle form submission for custom preferences.
   */
  handleFormSubmit(event) {
    event.preventDefault();
    
    try {
      const formData = new FormData(this.form);
      const preferences = {
        essential: true, // Always required.
        analytics: formData.has('analytics'),
        personalization: formData.has('personalization'),
        ads: formData.has('ads'),
        timestamp: new Date().toISOString()
      };
      
      this.savePreferences(preferences);
      this.trackConsentChoice('custom_save', preferences);
      
    } catch (error) {
      console.error('Error processing form submission:', error);
      this.showError('Une erreur est survenue lors de la sauvegarde de vos préférences.');
    }
  }
  
  /**
   * Save preferences to localStorage.
   */
  savePreferences(preferences) {
    try {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + this.EXPIRY_MONTHS);
      
      const data = {
        prefs: preferences,
        expiry: expiry.toISOString(),
        version: '1.0' // For future compatibility.
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      // Apply preferences immediately.
      this.applyPreferences(preferences);
      
      // Hide banner with animation.
      this.hideBanner();
      
      // Show confirmation message.
      this.showConfirmation('Vos préférences de cookies ont été sauvegardées.');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      this.showError('Impossible de sauvegarder vos préférences.');
    }
  }
  
  /**
   * Apply cookie preferences (placeholder for actual implementation).
   */
  applyPreferences(preferences) {
    // Here you would typically:
    // - Enable/disable analytics scripts.
    // - Configure personalization features.
    // - Set up advertising tracking.
    
    console.log('Applying cookie preferences:', preferences);
    
    // Example: Enable analytics if consented.
    if (preferences.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Store preferences in window object for other scripts.
    window.cookiePreferences = preferences;
  }
  
  /**
   * Enable analytics tracking (placeholder).
   */
  enableAnalytics() {
    // Placeholder for analytics initialization.
    console.log('Analytics enabled.');
  }
  
  /**
   * Disable analytics tracking (placeholder).
   */
  disableAnalytics() {
    // Placeholder for analytics disabling.
    console.log('Analytics disabled.');
  }
  
  /**
   * Track consent choices for compliance.
   */
  trackConsentChoice(choice, details = null) {
    // Log consent choice for audit trail.
    const consentLog = {
      choice,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      details
    };
    
    console.log('Consent choice tracked:', consentLog);
    
    // In a real implementation, you might send this to a server.
  }
  
  /**
   * Show banner with animation.
   */
  showBanner() {
    if (this.banner) {
      this.banner.style.display = 'block';
      // Force reflow for animation.
      this.banner.offsetHeight;
      this.banner.classList.add('visible');
    }
  }
  
  /**
   * Hide banner with animation.
   */
  hideBanner() {
    if (this.banner) {
      this.banner.style.opacity = '0';
      this.banner.style.transform = 'translateY(100%)';
      
      setTimeout(() => {
        this.banner.style.display = 'none';
      }, this.ANIMATION_DURATION);
    }
  }
  
  /**
   * Check if banner is currently visible.
   */
  isBannerVisible() {
    return this.banner && this.banner.style.display !== 'none';
  }
  
  /**
   * Check if settings panel is visible.
   */
  isSettingsVisible() {
    return this.settings && !this.settings.classList.contains('hidden');
  }
  
  /**
   * Show confirmation message.
   */
  showConfirmation(message) {
    this.showToast(message, 'success');
  }
  
  /**
   * Show error message.
   */
  showError(message) {
    this.showToast(message, 'error');
  }
  
  /**
   * Show toast notification.
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `cookie-toast cookie-toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.textContent = message;
    
    // Apply toast styles.
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      zIndex: '1001',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease-out',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });
    
    // Set background color based on type.
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#004aad'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animate in.
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay.
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  /**
   * Public method to show cookie settings (for footer link).
   */
  showCookieSettings() {
    if (!this.banner) {
      console.warn('Cookie banner not initialized.');
      return;
    }
    
    this.showBanner();
    this.handleCustomize();
  }
  
  /**
   * Public method to get current preferences.
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return data.prefs || null;
      
    } catch (error) {
      console.error('Error retrieving preferences:', error);
      return null;
    }
  }
}

/**
 * Initialize CookieManager on DOMContentLoaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  window.cookieManager = new CookieManager();
});
