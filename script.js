(function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        document.documentElement.classList.add('theme-transition');
        document.documentElement.classList.toggle('dark-mode');
        if (document.documentElement.classList.contains('dark-mode')) {
          localStorage.setItem('theme', 'dark');
        } else {
          localStorage.setItem('theme', 'light');
        }
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 500); 
      });
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
    // ----- PARAMÈTRES DU VOLET REPLIABLE -----
    const COLLAPSE_THRESHOLD = 10; // Seuil d'activation du volet (modifiable)
    const COLLAPSE_VISIBLE_COUNT = 5; // Nombre de documents visibles (modifiable)

    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

    // Fonction utilitaire pour le cache-buster
    async function applyCacheBuster(originalUrl, linkElement) {
        try {
            const response = await fetch(originalUrl, { method: 'HEAD', cache: 'no-cache' });
            if (!response.ok) return;

            const lastModified = response.headers.get('Last-Modified');
            if (lastModified) {
                const timestamp = new Date(lastModified).getTime();
                const versionedUrl = `${originalUrl}?v=${timestamp}`;
                linkElement.href = versionedUrl;
                linkElement.dataset.finalUrl = versionedUrl;
            }
        } catch (error) {
            // silencieux, pas bloquant
        }
    }

    // Nouvelle fonction pour créer un lien document (factorisation du code)
    function createFileLink(fileEntry, cat, subcat) {
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
        link.dataset.finalUrl = filePath;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = 'list-item';

        applyCacheBuster(filePath, link);

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

                const urlToUse = link.dataset.finalUrl || link.href;

                const tempLink = document.createElement('a');
                tempLink.href = urlToUse;
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

        return link;
    }


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
                            // --- Début du patch volet repliable ---
                            const totalFiles = subcat.files.length;
                            const shouldCollapse = totalFiles > COLLAPSE_THRESHOLD;

                            const listDiv = document.createElement('div');
                            listDiv.className = 'item-list';

                            // Fichiers visibles (hors repli)
                            for (let i = 0; i < (shouldCollapse ? COLLAPSE_VISIBLE_COUNT : totalFiles); i++) {
                                const fileEntry = subcat.files[i];
                                listDiv.appendChild(createFileLink(fileEntry, cat, subcat));
                            }

                            if (shouldCollapse) {
                                // Volet des fichiers cachés
                                const collapseDiv = document.createElement('div');
                                collapseDiv.className = 'item-list-collapsed';
                                collapseDiv.style.maxHeight = '0px';
                                collapseDiv.style.overflow = 'hidden';
                                collapseDiv.style.transition = 'max-height 0.45s cubic-bezier(.4,0,.2,1)';

                                for (let i = COLLAPSE_VISIBLE_COUNT; i < totalFiles; i++) {
                                    const fileEntry = subcat.files[i];
                                    collapseDiv.appendChild(createFileLink(fileEntry, cat, subcat));
                                }
                                listDiv.appendChild(collapseDiv);

                                // Dégradé + chevron
                                const gradientDiv = document.createElement('div');
                                gradientDiv.className = 'collapse-gradient';

                                const chevron = document.createElement('button');
                                chevron.className = 'collapse-chevron';
                                chevron.title = 'Afficher plus';
                                chevron.setAttribute('aria-expanded', 'false');
                                chevron.innerHTML = '<span class="chevron-icon"></span>';

                                let expanded = false;

                                chevron.onclick = function () {
                                    expanded = !expanded;
                                    collapseDiv.style.maxHeight = expanded ?
                                        collapseDiv.scrollHeight + 'px' :
                                        '0px';

                                    gradientDiv.classList.toggle('expanded', expanded);
                                    chevron.classList.toggle('expanded', expanded);
                                    chevron.setAttribute('aria-expanded', expanded);

                                    chevron.innerHTML = '<span class="chevron-icon"></span>';
                                };

                                gradientDiv.appendChild(chevron);
                                listDiv.appendChild(gradientDiv);
                            }

                            subcatDiv.appendChild(listDiv);
                            // --- Fin du patch volet repliable ---
                        }
                        catDiv.appendChild(subcatDiv);
                    });
                }
                container.appendChild(catDiv);
            });

        } catch (err) {
            console.error("Erreur:", err);
            container.textContent = 'Impossible de charger le contenu.';
        } finally {
            mainPageBody.classList.add('loaded');
        }
    }

    loadContent();

    const concoursDate = new Date("2027-04-26");
    
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
        el.textContent = `Il reste ${days} jours avant les concours.`;
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
