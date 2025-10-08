// Gestion des données personnelles

function requestDataExport() {
    console.log("Exportation des données demandée.");
    alert("Votre demande d'exportation de données a été prise en compte.");
    // Simuler une requête serveur
    setTimeout(() => {
        console.log("Données exportées avec succès.");
    }, 2000);
}

function showDataDetails() {
    console.log("Affichage des détails des données.");
    alert("Affichage des détails de vos données personnelles.");
}

function requestCorrection() {
    const correction = prompt("Veuillez indiquer les corrections à apporter :");
    if (correction) {
        console.log(`Correction demandée : ${correction}`);
        alert("Votre demande de correction a été envoyée.");
    } else {
        alert("Aucune correction spécifiée.");
    }
}

function requestPortability(format) {
    console.log(`Portabilité demandée au format ${format.toUpperCase()}.`);
    alert(`Vos données seront exportées au format ${format.toUpperCase()}.`);
}

function manageConsents() {
    console.log("Gestion des consentements en cours.");
    alert("Gestion de vos consentements en cours.");
}

function optOutMarketing() {
    console.log("Désinscription des emails marketing.");
    alert("Vous êtes désinscrit des emails marketing.");
}

function limitProcessing() {
    console.log("Limitation du traitement des données.");
    alert("Le traitement de vos données est limité.");
}

function requestAccountDeactivation() {
    const confirmDeactivation = confirm("Êtes-vous sûr de vouloir désactiver temporairement votre compte ?");
    if (confirmDeactivation) {
        console.log("Compte temporairement désactivé.");
        alert("Votre compte sera temporairement désactivé.");
    } else {
        alert("Action annulée.");
    }
}

function requestAccountDeletion() {
    const confirmDeletion = confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.");
    if (confirmDeletion) {
        console.log("Compte supprimé définitivement.");
        alert("Votre compte et vos données seront définitivement supprimés.");
    } else {
        alert("Action annulée.");
    }
}