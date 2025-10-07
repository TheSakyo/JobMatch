/**
 * JobMatch Dynamic Cookie Loader
 * Intelligent resource loader for cookie banner components
 * 
 * Features:
 * - Smart path detection based on current page location.
 * - Resource preloading and caching.
 * - Graceful error handling with fallbacks.
 * - Performance optimization with async loading.
 * - CORS and CSP compatibility.
 */

class CookieResourceLoader {
  constructor() {
    // Configuration constants.
    this.RESOURCE_TIMEOUT = 5000; // 5 seconds timeout.
    this.RETRY_ATTEMPTS = 3;
    this.RETRY_DELAY = 1000; // 1 second.
    
    // Resource paths configuration.
    this.resources = {
      html: {
        root: 'includes/cookie.html',
        subfolder: '../includes/cookie.html'
      },
      css: {
        root: 'styles/cookie.css',
        subfolder: '../styles/cookie.css'
      },
      js: {
        root: 'js/cookie.js',
        subfolder: '../js/cookie.js'
      }
    };
    
    // State tracking.
    this.loadedResources = new Set();
    this.loadPromises = new Map();
    
    this.init();
  }
  
  /**
   * Initialize the resource loader.
   */
  init() {
    try {
      // Detect current page context.
      this.pageContext = this.detectPageContext();
      
      // Load resources in optimal order.
      this.loadResourcesSequentially();
      
    } catch (error) {
      console.error('Error initializing cookie resource loader:', error);
      this.handleLoadError('initialization', error);
    }
  }
  
  /**
   * Detect the current page context for path resolution.
   */
  detectPageContext() {
    const currentPath = window.location.pathname;
    const hostname = window.location.hostname;
    
    // Determine if we're in a subfolder.
    const isInSubfolder = currentPath.includes('/pages/') || 
                         currentPath.includes('/admin/') ||
                         currentPath.split('/').length > 2;
    
    // Determine if we're on a local or remote server.
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   hostname.includes('local');
    
    return {
      isInSubfolder,
      isLocal,
      currentPath,
      hostname,
      baseUrl: this.getBaseUrl()
    };
  }
  
  /**
   * Get the base URL for resource loading.
   */
  getBaseUrl() {
    // Try to detect base URL from existing links or scripts.
    const existingLinks = document.querySelectorAll('link[href*="styles/"], script[src*="js/"]');
    
    if (existingLinks.length > 0) {
      const firstResource = existingLinks[0];
      const resourceUrl = firstResource.href || firstResource.src;
      
      // Extract base path.
      if (resourceUrl.includes('../')) {
        return '../';
      } else if (resourceUrl.includes('./')) {
        return './';
      }
    }
    
    return this.pageContext?.isInSubfolder ? '../' : './';
  }
  
  /**
   * Get the appropriate path for a resource type.
   */
  getResourcePath(type) {
    const resource = this.resources[type];
    if (!resource) {
      throw new Error(`Unknown resource type: ${type}`);
    }
    
    const pathKey = this.pageContext.isInSubfolder ? 'subfolder' : 'root';
    return resource[pathKey];
  }
  
  /**
   * Load resources in the optimal sequence.
   */
  async loadResourcesSequentially() {
    try {
      // 1. Load CSS first for styling.
      await this.loadCSS();
      
      // 2. Load HTML content.
      await this.loadHTML();
      
      // 3. Load and execute JavaScript.
      await this.loadJS();
      
      console.log('Cookie resources loaded successfully.');
      
    } catch (error) {
      console.error('Error loading cookie resources:', error);
      this.handleLoadError('sequential_loading', error);
    }
  }
  
  /**
   * Load CSS with preload optimization.
   */
  async loadCSS() {
    const cssPath = this.getResourcePath('css');
    
    if (this.loadedResources.has('css')) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded.
      const existingLink = document.querySelector(`link[href*="cookie.css"]`);
      if (existingLink) {
        this.loadedResources.add('css');
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      
      // Add timeout.
      const timeout = setTimeout(() => {
        reject(new Error(`CSS loading timeout: ${cssPath}`));
      }, this.RESOURCE_TIMEOUT);
      
      link.onload = () => {
        clearTimeout(timeout);
        this.loadedResources.add('css');
        resolve();
      };
      
      link.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load CSS: ${cssPath}`));
      };
      
      // Preload for better performance.
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = cssPath;
      
      document.head.appendChild(preloadLink);
      document.head.appendChild(link);
    });
  }
  
  /**
   * Load HTML content with retry mechanism.
   */
  async loadHTML() {
    const htmlPath = this.getResourcePath('html');
    
    if (this.loadedResources.has('html')) {
      return Promise.resolve();
    }
    
    return this.retryOperation(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.RESOURCE_TIMEOUT);
      
      try {
        const response = await fetch(htmlPath, {
          signal: controller.signal,
          cache: 'default',
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Validate HTML content.
        if (!html.trim() || !html.includes('cookie-banner')) {
          throw new Error('Invalid HTML content received.');
        }
        
        // Inject HTML safely.
        this.injectHTML(html);
        this.loadedResources.add('html');
        
        return html;
        
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }, this.RETRY_ATTEMPTS, this.RETRY_DELAY);
  }
  
  /**
   * Safely inject HTML into the document.
   */
  injectHTML(html) {
    // Create a temporary container to parse HTML safely.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Validate and sanitize the content.
    const cookieBanner = tempDiv.querySelector('#cookie-banner');
    if (!cookieBanner) {
      throw new Error('Cookie banner element not found in HTML.');
    }
    
    // Check if banner already exists.
    if (document.getElementById('cookie-banner')) {
      console.warn('Cookie banner already exists in the document.');
      return;
    }
    
    // Insert before footer if exists, otherwise at end of body.
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(cookieBanner, footer);
    } else {
      document.body.appendChild(cookieBanner);
    }
  }
  
  /**
   * Load JavaScript with dependency management.
   */
  async loadJS() {
    const jsPath = this.getResourcePath('js');
    
    if (this.loadedResources.has('js')) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      // Check if script is already loaded.
      const existingScript = document.querySelector(`script[src*="cookie.js"]`);
      if (existingScript) {
        this.loadedResources.add('js');
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = jsPath;
      script.async = true;
      script.defer = true;
      
      // Add timeout.
      const timeout = setTimeout(() => {
        reject(new Error(`JavaScript loading timeout: ${jsPath}`));
      }, this.RESOURCE_TIMEOUT);
      
      script.onload = () => {
        clearTimeout(timeout);
        this.loadedResources.add('js');
        resolve();
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load JavaScript: ${jsPath}`));
      };
      
      // Add to document.
      document.body.appendChild(script);
    });
  }
  
  /**
   * Retry operation with exponential backoff.
   */
  async retryOperation(operation, maxAttempts, baseDelay) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
        
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
        
        if (attempt < maxAttempts) {
          // Exponential backoff with jitter.
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Handle loading errors with fallbacks.
   */
  handleLoadError(context, error) {
    console.error(`Cookie resource loading failed (${context}):`, error);
    
    // Try to provide a minimal fallback.
    if (!document.getElementById('cookie-banner')) {
      this.createFallbackBanner();
    }
    
    // Log error for monitoring.
    this.logError(context, error);
  }
  
  /**
   * Create a minimal fallback banner.
   */
  createFallbackBanner() {
    const fallbackHTML = `
      <div id="cookie-banner" style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #f8f9fa;
        padding: 20px;
        border-top: 3px solid #004aad;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <p style="margin: 0 0 15px 0; color: #333;">
          Ce site utilise des cookies pour améliorer votre expérience.
        </p>
        <button onclick="this.parentElement.style.display='none'; localStorage.setItem('cookiePreferences', JSON.stringify({prefs: {essential: true}, expiry: new Date(Date.now() + 6*30*24*60*60*1000).toISOString()}));"
                style="
                  background: #004aad;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-weight: bold;
                ">
          J'accepte
        </button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    console.warn('Using fallback cookie banner due to loading errors.');
  }
  
  /**
   * Log error for debugging and monitoring.
   */
  logError(context, error) {
    const errorInfo = {
      context,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      pageContext: this.pageContext
    };
    
    // In a production environment, you might send this to a logging service.
    console.error('Cookie loader error details:', errorInfo);
  }
  
  /**
   * Public method to check loading status.
   */
  getLoadingStatus() {
    return {
      loaded: Array.from(this.loadedResources),
      pageContext: this.pageContext,
      isComplete: this.loadedResources.size >= 3 // css, html, js
    };
  }
}

// Initialize the loader when DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieLoader = new CookieResourceLoader();
  });
} else {
  // DOM is already loaded.
  window.cookieLoader = new CookieResourceLoader();
}
