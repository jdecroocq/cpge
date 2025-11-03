if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('SW enregistré'))
    .catch(err => console.error('Erreur SW:', err));
}
