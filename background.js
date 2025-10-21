document.addEventListener('DOMContentLoaded', () => {
    const interactiveBubble = document.getElementById('interactive-bubble');

    if (!interactiveBubble) return;

    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    function move() {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        const bubbleSize = interactiveBubble.offsetWidth / 2;
        interactiveBubble.style.transform = `translate(${Math.round(curX - bubbleSize)}px, ${Math.round(curY - bubbleSize)}px)`;
        
        requestAnimationFrame(move);
    }

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    move();
});
