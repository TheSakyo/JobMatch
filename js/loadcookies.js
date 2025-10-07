// loadCookies.js
// This script dynamically loads the cookie banner HTML into every page
document.addEventListener("DOMContentLoaded", () => {
  fetch("../includes/cookies.html") // Chemin selon ta structure (adapter si besoin)
    .then(response => response.text())
    .then(html => {
      // Injecte le contenu juste avant le footer ou à la fin du body
      document.body.insertAdjacentHTML("beforeend", html);

      // Charge ensuite le script de gestion des cookies
      const script = document.createElement("script");
      script.src = "../js/cookies.js"; // Script logique (accept/refus/etc.)
      document.body.appendChild(script);
    })
    .catch(err => console.error("Erreur de chargement du bandeau cookies :", err));
});
