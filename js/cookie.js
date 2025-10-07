// cookies.js
// This script manages cookie preferences and saves them in localStorage

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const settings = document.getElementById("cookie-settings");
  const acceptAll = document.getElementById("accept-all");
  const rejectAll = document.getElementById("reject-all");
  const customize = document.getElementById("customize");
  const back = document.getElementById("back");
  const form = document.getElementById("cookiePreferencesForm");

  // Check if user has already made a choice
  const cookiePrefs = localStorage.getItem("cookiePreferences");
  if (cookiePrefs) {
    banner.style.display = "none";
    return;
  }

  // Accept all cookies
  acceptAll.addEventListener("click", () => {
    savePreferences({ analytics: true, personalization: true, ads: true });
  });

  // Reject all cookies
  rejectAll.addEventListener("click", () => {
    savePreferences({ analytics: false, personalization: false, ads: false });
  });

  // Show customization menu
  customize.addEventListener("click", () => {
    banner.querySelector(".cookie-content").style.display = "none";
    settings.classList.remove("hidden");
  });

  // Back to main banner
  back.addEventListener("click", () => {
    settings.classList.add("hidden");
    banner.querySelector(".cookie-content").style.display = "block";
  });

  // Save custom preferences
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const preferences = Object.fromEntries(new FormData(form).entries());
    for (let key in preferences) preferences[key] = preferences[key] === "on";
    savePreferences(preferences);
  });

  // Save in localStorage with 6-month validity
  function savePreferences(prefs) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);
    const data = { prefs, expiry: expiry.toISOString() };
    localStorage.setItem("cookiePreferences", JSON.stringify(data));
    banner.style.display = "none";
  }
});
