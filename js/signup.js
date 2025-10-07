// Example: simple client-side validation for demonstration
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (!regex.test(password)) {
            alert('Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.');
            return;
        }

        // Ici tu pourrais envoyer les données via fetch / AJAX vers ton backend
        alert('Compte créé avec succès ! (simulation)');
        form.reset();
    });
});
