document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('timer-display');
    const input = document.getElementById('target-time');
    let intervalId = null;

    // Fonction pour ajouter un zéro devant les chiffres < 10
    const pad = (num) => num.toString().padStart(2, '0');

    function calculateTime() {
        if (!input.value) {
            display.textContent = "--:--";
            return;
        }

        const now = new Date();
        const [targetHours, targetMinutes] = input.value.split(':').map(Number);
        
        let targetDate = new Date();
        targetDate.setHours(targetHours, targetMinutes, 0, 0);

        // Si l'heure cible est passée pour aujourd'hui, on vise demain
        // (Ex: il est 20h, on demande 04h -> c'est 04h demain matin)
        if (targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const diff = targetDate - now;
        
        // Conversion en heures/minutes/secondes
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        // Affichage HH:MM (j'ai ajouté les secondes en petit bonus optionnel, 
        // ou on peut garder juste HH:MM comme demandé)
        // Pour coller à ta demande "Heure Minutes", voici le format :
        display.textContent = `${pad(hours)}:${pad(minutes)}`;
        
        // Si tu préfères voir les secondes pour que ça bouge plus :
        // display.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Mise à jour au changement de l'input
    input.addEventListener('input', () => {
        calculateTime(); // Update immédiat
        
        // On lance la boucle si elle n'existe pas
        if (!intervalId) {
            intervalId = setInterval(calculateTime, 1000);
        }
    });

    // Initialisation si le navigateur a gardé une valeur en cache
    if (input.value) {
        calculateTime();
        intervalId = setInterval(calculateTime, 1000);
    }
});
