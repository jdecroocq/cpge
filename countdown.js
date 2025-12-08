document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('timer-display');
    const input = document.getElementById('target-time');
    let intervalId = null;

    // Fonction pour ajouter un zéro devant (0 -> 00)
    const pad = (num) => num.toString().padStart(2, '0');

    function calculateTime() {
        if (!input.value) {
            display.textContent = "00:00:00";
            return;
        }

        const now = new Date();
        const [targetHours, targetMinutes] = input.value.split(':').map(Number);
        
        let targetDate = new Date();
        targetDate.setHours(targetHours, targetMinutes, 0, 0);

        // Si l'heure cible est passée pour aujourd'hui, on vise demain
        if (targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const diff = targetDate - now;
        
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        // Affichage HH:MM:SS
        display.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Mise à jour immédiate lors de la frappe
    input.addEventListener('input', () => {
        calculateTime();
        if (!intervalId) {
            intervalId = setInterval(calculateTime, 1000);
        }
    });

    // Gestion du focus pour faciliter la saisie
    // Quand on clique sur l'input, on sélectionne tout le texte pour écraser rapidement
    input.addEventListener('focus', () => {
        // Petit délai pour que le focus natif se fasse avant la sélection
        setTimeout(() => input.select(), 50);
    });

    // Initialisation
    calculateTime();
});
