// Example JS for interactivity
document.addEventListener('DOMContentLoaded', () => {
    console.log("JobMatch+ page loaded");

    // Smooth scroll for nav links
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
