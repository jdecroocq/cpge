document.addEventListener('DOMContentLoaded', () => {
    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

    async function loadContent() {
        try {
            const response = await fetch('list.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const categories = await response.json();

            if (categories.length === 0) {
                container.textContent = 'Aucune catégorie à afficher.';
                return;
            }

            categories.forEach(cat => {
                const catDiv = document.createElement('div');
                catDiv.className = 'content-category';

                const catTitle = document.createElement('h2');
                catTitle.textContent = cat.title;
                catDiv.appendChild(catTitle);

                if (!cat.subcategories || cat.subcategories.length === 0) {
                    const emptyMsg = document.createElement('p');
                    emptyMsg.className = 'empty-message';
                    emptyMsg.textContent = 'Aucune section.';
                    catDiv.appendChild(emptyMsg);
                } else {
                    cat.subcategories.forEach(subcat => {
                        const subcatDiv = document.createElement('div');
                        subcatDiv.className = 'content-subcategory';
                        
                        const subcatTitle = document.createElement('h3');
                        subcatTitle.textContent = subcat.name;
                        subcatDiv.appendChild(subcatTitle);

                        if (!subcat.files || subcat.files.length === 0) {
                            const emptyMsg = document.createElement('p');
                            emptyMsg.className = 'empty-message';
                            emptyMsg.textContent = 'Aucun document.';
                            subcatDiv.appendChild(emptyMsg);
                        } else {
                            const listDiv = document.createElement('div');
                            listDiv.className = 'item-list';

                            subcat.files.forEach(fileEntry => {
                                let cleanFileName = fileEntry;
                                let flagsPart = '';

                                const lastDotIndex = fileEntry.lastIndexOf('.');
                                if (lastDotIndex > 0) {
                                    const firstFlagIndex = fileEntry.indexOf('_', lastDotIndex);
                                    if (firstFlagIndex > -1) {
                                        cleanFileName = fileEntry.substring(0, firstFlagIndex);
                                        flagsPart = fileEntry.substring(firstFlagIndex);
                                    }
                                }

                                const isProtected = flagsPart.includes('_s');
                                const isDownloadable = flagsPart.includes('_t');
                                const filePath = `${cat.folder}/${subcat.name}/${cleanFileName}`;

                                const link = document.createElement('a');
                                link.href = filePath;
                                link.target = "_blank";
                                link.rel = "noopener noreferrer";
                                link.className = 'list-item';

                                const fileNameSpan = document.createElement('span');
                                fileNameSpan.className = 'item-name';
                                fileNameSpan.textContent = cleanFileName;
                                link.appendChild(fileNameSpan);

                                const iconsContainer = document.createElement('span');
                                iconsContainer.className = 'item-icons';

                                if (isDownloadable) {
                                    const downloadIcon = document.createElement('span');
                                    downloadIcon.className = 'icon icon-download';
                                    downloadIcon.title = 'Télécharger le fichier';

                                    downloadIcon.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const tempLink = document.createElement('a');
                                        tempLink.href = filePath;
                                        tempLink.setAttribute('download', cleanFileName);
                                        tempLink.style.display = 'none';
                                        document.body.appendChild(tempLink);
                                        tempLink.click();
                                        document.body.removeChild(tempLink);
                                    });
                                    
                                    iconsContainer.appendChild(downloadIcon);
                                }
                                
                                if (isProtected) {
                                    const protectedIcon = document.createElement('span');
                                    protectedIcon.className = 'icon icon-protected';
                                    iconsContainer.appendChild(protectedIcon);
                                }

                                if (iconsContainer.hasChildNodes()) {
                                    link.appendChild(iconsContainer);
                                }

                                listDiv.appendChild(link);
                            });
                            subcatDiv.appendChild(listDiv);
                        }
                        catDiv.appendChild(subcatDiv);
                    });
                }
                container.appendChild(catDiv);
            });

        } catch (err) {
            console.error("Erreur lors du chargement de la liste:", err);
            container.textContent = 'Impossible de charger le contenu. Vérifiez la console pour plus de détails.';
        } finally {
            mainPageBody.classList.add('loaded');
        }
    }

    loadContent();

    const concoursDate = new Date("2027-04-26"); /* à modifier quand la date sortira */
    
    function getDaysLeft(targetDate) {
      const now = new Date();
      const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const msPerDay = 1000 * 60 * 60 * 24;
      return Math.floor((utcTarget - utcNow) / msPerDay);
    }
    
    function updateCountdown() {
      const el = document.getElementById("countdown");
      if (!el) return;
    
      const days = getDaysLeft(concoursDate);
    
      if (isNaN(days)) {
        el.textContent = "Date invalide.";
      } else if (days > 1) {
        el.textContent = `Il reste environ ${days} jours avant les concours.`; /* à modifier quand la date sortira */
      } else if (days === 1) {
        el.textContent = `Il reste 1 jour avant les concours !`;
      } else if (days === 0) {
        el.textContent = `Il reste 0 jour avant les concours !`;
      } else {
        el.textContent = `Les concours ont commencé.`;
      }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60);
});

document.addEventListener('click', async (ev) => {
  try {
    const a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return; // pas un lien
    // si lien a explicitement download, on laisse le navigateur faire son job
    if (a.hasAttribute('download')) return;

    const href = a.href;
    if (!href) return;

    const url = new URL(href, location.href);

    // Ne traiter que les liens same-origin (évite de casser les liens externes)
    if (url.origin !== location.origin) return;

    // Détecter s'il s'agit d'un fichier (a une extension)
    const m = url.pathname.match(/\.([a-z0-9]{1,8})($|[?#])/i);
    if (!m) return; // pas d'extension => probablement une page HTML, on ignore

    const ext = (m[1] || '').toLowerCase();
    // Ne pas intercepter les pages HTML courantes
    const htmlExts = ['html', 'htm', 'php', 'asp', 'aspx', 'jsp'];
    if (htmlExts.includes(ext)) return;

    // On intercepte : empêcher navigation par défaut
    ev.preventDefault();

    // Essayer de récupérer la ressource en forçant la validation réseau
    const fetchOptions = {
      cache: 'no-cache',          // demande au navigateur de vérifier le réseau
      credentials: 'same-origin'  // garder les mêmes cookies si besoin
    };

    let res;
    try {
      res = await fetch(url.href, fetchOptions);
    } catch (err) {
      // échec réseau : fallback vers l'ouverture normale du lien
      console.warn('Fetch échoué, fallback vers ouverture normale :', err);
      window.open(url.href, a.target || '_blank');
      return;
    }

    if (!res.ok) {
      // si erreur (404, etc.), on ouvre quand même l'URL brute pour afficher message serveur
      window.open(url.href, a.target || '_blank');
      return;
    }

    const contentType = res.headers.get('content-type') || '';

    // Si c'est du HTML (ou similaire), on fait une navigation normale (équivalent click)
    if (contentType.includes('text/html')) {
      // on peut remplacer la page courante ou ouvrir dans un onglet selon target
      if (a.target === '_blank') {
        window.open(url.href, '_blank');
      } else {
        location.href = url.href;
      }
      return;
    }

    // Pour les autres types (pdf, images, vidéos, docs...), on crée un blob et on ouvre
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Essayer d'ouvrir dans un nouvel onglet
    const w = window.open(blobUrl, a.target || '_blank');
    if (!w) {
      // Popup bloquée : on propose d'ouvrir dans le même onglet
      const confirmOpen = confirm('Popup bloquée. Ouvrir le fichier dans cet onglet ?');
      if (confirmOpen) {
        location.href = blobUrl;
      } else {
        // libérer le blob sinon fuite mémoire
        URL.revokeObjectURL(blobUrl);
      }
      return;
    }

    // Libération du blob après un délai (permet lecture)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
  } catch (err) {
    console.error('Erreur dans l\'intercepteur de liens :', err);
  }
});
