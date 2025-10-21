// Fichier : background.js (nouveau contenu)
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Définissons une résolution de rendu faible. C'est la clé de la performance.
    const renderWidth = 200;
    const renderHeight = 200;
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    // On applique le filtre "goo" directement sur le contexte du canvas
    ctx.filter = 'url(#goo)';

    const mouse = { x: renderWidth / 2, y: renderHeight / 2 };

    window.addEventListener('mousemove', (event) => {
        // On convertit les coordonnées de la souris (fenêtre) en coordonnées du canvas (rendu)
        mouse.x = (event.clientX / window.innerWidth) * renderWidth;
        mouse.y = (event.clientY / window.innerHeight) * renderHeight;
    });

    // Classe pour gérer chaque bulle
    class Bubble {
        constructor(x, y, radius, color, speedX, speedY) {
            this.x = x;
            this.y = y;
            this.startX = x;
            this.startY = y;
            this.radius = radius;
            this.color = color;
            this.speedX = speedX;
            this.speedY = speedY;
        }

        update(t) {
            // Mouvement sinusoïdal simple pour recréer l'effet de flottaison
            this.x = this.startX + Math.sin(t * this.speedX) * (renderWidth * 0.2);
            this.y = this.startY + Math.cos(t * this.speedY) * (renderHeight * 0.2);
        }

        draw(context) {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
        }
    }
    
    // Création des bulles (paramètres ajustés pour la petite taille du canvas)
    const bubbles = [
        new Bubble(renderWidth * 0.2, renderHeight * 0.3, 35, 'hsl(225, 80%, 60%)', 0.0002, 0.0003),
        new Bubble(renderWidth * 0.8, renderHeight * 0.7, 50, 'hsl(205, 80%, 60%)', 0.0004, -0.0002),
        new Bubble(renderWidth * 0.7, renderHeight * 0.2, 30, 'hsl(215, 80%, 60%)', -0.0003, 0.0004),
        new Bubble(renderWidth * 0.3, renderHeight * 0.8, 45, 'hsl(235, 80%, 60%)', -0.0002, -0.0003),
    ];

    // Bulle interactive
    let interactiveBubble = {
        x: mouse.x,
        y: mouse.y,
        radius: 30,
        color: 'hsl(225, 80%, 60%)'
    };

    let lastTime = 0;
    function animate(timestamp) {
        const t = timestamp || 0;
        
        // Lissage du mouvement de la bulle interactive
        interactiveBubble.x += (mouse.x - interactiveBubble.x) * 0.05;
        interactiveBubble.y += (mouse.y - interactiveBubble.y) * 0.05;

        // Effacer le canvas
        ctx.clearRect(0, 0, renderWidth, renderHeight);

        // Mettre à jour et dessiner chaque bulle
        bubbles.forEach(bubble => {
            bubble.update(t);
            bubble.draw(ctx);
        });

        // Dessiner la bulle interactive
        ctx.beginPath();
        ctx.arc(interactiveBubble.x, interactiveBubble.y, interactiveBubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = interactiveBubble.color;
        ctx.fill();

        requestAnimationFrame(animate);
    }

    animate();
});
