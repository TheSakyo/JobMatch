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

/**
 * Simulate login for demo purposes.
 */
function simulateLogin() {
    const userType = document.getElementById('user-type').value;
    
    if (!userType) {
        alert('Veuillez d\'abord sélectionner votre type de profil (Candidat ou Recruteur).');
        return;
    }
    
    // Simulate login process.
    alert(`🎉 Connexion simulée en tant que ${userType} !\n\nVous allez être redirigé vers votre profil...`);
    
    // Store user state in session for demo.
    sessionStorage.setItem('userType', userType);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userName', userType === 'candidat' ? 'John Doe' : 'Entreprise SARL');
    
    // Redirect to profile.
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1500);
}
