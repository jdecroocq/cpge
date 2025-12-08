document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('timer-display');
    const input = document.getElementById('target-time');
    let intervalId = null;

    const pad = (num) => num.toString().padStart(2, '0');

    function calculateTime() {
        const rawValue = input.value;
        
        if (rawValue.length !== 5 || !rawValue.includes(':')) {
            const defaultTime = "00:00:00";
            display.textContent = defaultTime;
            document.title = "Minuteur";
            return;
        }

        const [hoursStr, minutesStr] = rawValue.split(':');
        const targetHours = parseInt(hoursStr, 10);
        const targetMinutes = parseInt(minutesStr, 10);

        if (isNaN(targetHours) || isNaN(targetMinutes) || targetHours > 23 || targetMinutes > 59) {
            display.textContent = "00:00:00";
            document.title = "Minuteur";
            return;
        }

        const now = new Date();
        let targetDate = new Date();
        targetDate.setHours(targetHours, targetMinutes, 0, 0);

        if (targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const diff = targetDate - now;
        
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        display.textContent = timeString;
        
        document.title = timeString;
    }

    input.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);

        if (val.length > 2) {
            e.target.value = val.slice(0, 2) + ':' + val.slice(2);
        } else {
            e.target.value = val;
        }

        calculateTime();
        
        if (!intervalId) {
            intervalId = setInterval(calculateTime, 1000);
        }
    });

    input.addEventListener('focus', () => {
        setTimeout(() => input.select(), 50);
    });
    
    calculateTime();
});
