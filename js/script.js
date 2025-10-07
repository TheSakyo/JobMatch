// Example JS for interactivity
document.addEventListener('DOMContentLoaded', () => {
    console.log("JobMatch+ page loaded");

    // Smooth scroll for nav links
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', e => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// Fonction pour afficher les paramètres de cookies depuis le footer
function showCookieSettings() {
    const banner = document.getElementById('cookie-banner');
    const settings = document.getElementById('cookie-settings');
    
    if (banner) {
        banner.style.display = 'block';
        if (settings) {
            settings.classList.remove('hidden');
        }
    } else {
        alert('Le panneau de gestion des cookies se chargera sous peu...');
    }
}
