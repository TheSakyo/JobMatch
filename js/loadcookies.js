// loadCookies.js
// This script dynamically loads the cookie banner HTML into every page
document.addEventListener("DOMContentLoaded", () => {
  // Détermine le chemin en fonction de l'emplacement de la page
  const isInSubfolder = window.location.pathname.includes('/pages/');
  const cookieHtmlPath = isInSubfolder ? "../includes/cookie.html" : "includes/cookie.html";
  const cookieJsPath = isInSubfolder ? "../js/cookie.js" : "js/cookie.js";
  const cookieCssPath = isInSubfolder ? "../styles/cookie.css" : "styles/cookie.css";
  
  // Charge le CSS des cookies
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cookieCssPath;
  document.head.appendChild(link);
  
  fetch(cookieHtmlPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      // Injecte le contenu juste avant le footer ou à la fin du body
      document.body.insertAdjacentHTML("beforeend", html);

      // Charge ensuite le script de gestion des cookies
      const script = document.createElement("script");
      script.src = cookieJsPath;
      document.body.appendChild(script);
    })
    .catch(err => console.error("Erreur de chargement du bandeau cookies :", err));
});
