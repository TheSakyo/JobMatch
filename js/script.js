/**
 * JobMatch Main Script
 * Handles page interactions, animations, and user experience enhancements
 */

class JobMatchApp {
  constructor() {
    this.isInitialized = false;
    this.observers = [];
    
    // Bind methods to maintain context.
    this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
    this.handleResize = this.debounce(this.handleResize.bind(this), 250);
    this.handleNavClick = this.handleNavClick.bind(this);
    
    this.init();
  }
  
  /**
   * Initialize the application.
   */
  init() {
    if (this.isInitialized) return;
    
    try {
      this.setupIntersectionObserver();
      this.setupSmoothScrolling();
      this.setupEventListeners();
      this.setupAnimations();
      this.setupProgressiveEnhancement();
      
      this.isInitialized = true;
      console.log('JobMatch app initialized successfully.');
      
    } catch (error) {
      console.error('Error initializing JobMatch app:', error);
    }
  }
  
  /**
   * Setup Intersection Observer for animations.
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - show all elements.
      this.showAllElements();
      return;
    }
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all animated elements.
    const animatedElements = document.querySelectorAll('.fade-in-up, .step, .offers > div');
    animatedElements.forEach(el => {
      observer.observe(el);
    });
    
    this.observers.push(observer);
  }
  
  /**
   * Fallback for browsers without IntersectionObserver.
   */
  showAllElements() {
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
  
  /**
   * Setup smooth scrolling for navigation links.
   */
  setupSmoothScrolling() {
    // Check if browser supports CSS scroll-behavior.
    if (!CSS.supports('scroll-behavior', 'smooth')) {
      this.setupPolyfillScrolling();
    }
  }
  
  /**
   * Polyfill for smooth scrolling in older browsers.
   */
  setupPolyfillScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();
          this.smoothScrollTo(targetElement, 800);
        }
      });
    });
  }
  
  /**
   * Smooth scroll to element (polyfill).
   */
  smoothScrollTo(element, duration = 800) {
    const targetPosition = element.offsetTop - 80; // Account for sticky header.
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      
      window.scrollTo(0, run);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  }
  
  /**
   * Easing function for smooth animations.
   */
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  /**
   * Setup event listeners.
   */
  setupEventListeners() {
    // Scroll event for header.
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Resize event for responsive adjustments.
    window.addEventListener('resize', this.handleResize, { passive: true });
    
    // Navigation click handling.
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick);
    });
    
    // Form enhancement.
    this.enhanceForms();
  }
  
  /**
   * Handle scroll events.
   */
  handleScroll() {
    const scrollY = window.pageYOffset;
    const header = document.querySelector('header');
    
    if (header) {
      // Add shadow to header on scroll.
      if (scrollY > 10) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
      }
    }
    
    // Update active navigation item.
    this.updateActiveNavItem();
  }
  
  /**
   * Update active navigation item based on scroll position.
   */
  updateActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }
  
  /**
   * Handle resize events.
   */
  handleResize() {
    // Recalculate any size-dependent calculations.
    this.updateActiveNavItem();
  }
  
  /**
   * Handle navigation clicks.
   */
  handleNavClick(event) {
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Track navigation clicks.
    if (window.gtag) {
      gtag('event', 'navigation_click', {
        'target_section': href,
        'event_category': 'engagement'
      });
    }
  }
  
  /**
   * Setup animations.
   */
  setupAnimations() {
    // Reduce animations for users who prefer reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animatedElements = document.querySelectorAll('.fade-in-up');
      animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }
  
  /**
   * Enhance forms with better UX.
   */
  enhanceForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add loading states to buttons.
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        form.addEventListener('submit', (e) => {
          submitButton.classList.add('loading');
          submitButton.disabled = true;
          
          // Re-enable after timeout (fallback).
          setTimeout(() => {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
          }, 5000);
        });
      }
      
      // Add input validation feedback.
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', this.validateInput.bind(this));
        input.addEventListener('input', this.clearValidation.bind(this));
      });
    });
  }
  
  /**
   * Validate input fields.
   */
  validateInput(event) {
    const input = event.target;
    const isValid = input.checkValidity();
    
    // Remove existing validation classes.
    input.classList.remove('valid', 'invalid');
    
    if (input.value.trim()) {
      input.classList.add(isValid ? 'valid' : 'invalid');
    }
  }
  
  /**
   * Clear validation styling.
   */
  clearValidation(event) {
    const input = event.target;
    input.classList.remove('invalid');
  }
  
  /**
   * Setup progressive enhancement features.
   */
  setupProgressiveEnhancement() {
    // Add class to indicate JavaScript is enabled.
    document.documentElement.classList.add('js-enabled');
    
    // Lazy load images.
    this.setupLazyLoading();
    
    // Setup service worker if supported.
    this.setupServiceWorker();
  }
  
  /**
   * Setup lazy loading for images.
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
      });
      
      this.observers.push(imageObserver);
    }
  }
  
  /**
   * Setup service worker for caching and offline support.
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      // Service worker registration is handled in the HTML.
      navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker ready.');
      });
    }
  }
  
  /**
   * Throttle function calls.
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Debounce function calls.
   */
  debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  }
  
  /**
   * Cleanup method for removing event listeners and observers.
   */
  cleanup() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    
    this.observers = [];
    this.isInitialized = false;
  }
}

// Global functions for backward compatibility.
window.showCookieSettings = window.showCookieSettings || (() => {
  console.warn('Cookie settings not available yet.');
});

// Initialize app when DOM is ready.
let jobMatchApp = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    jobMatchApp = new JobMatchApp();
  });
} else {
  jobMatchApp = new JobMatchApp();
}

// Export for potential module use.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobMatchApp;
}
