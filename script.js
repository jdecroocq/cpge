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

// Countdown timer
document.addEventListener('DOMContentLoaded', () => {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;

  function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const concourseDate = new Date(currentYear, 5, 1); // 1er juin

    if (now > concourseDate) {
      concourseDate.setFullYear(currentYear + 1);
    }

    const diff = concourseDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text = '';
    if (days > 0) {
      text = `${days} jour${days > 1 ? 's' : ''}, ${hours}h ${minutes}min`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}min`;
    } else {
      text = `${minutes}min`;
    }

    countdownElement.textContent = text;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);
});

// Main content loading
document.addEventListener('DOMContentLoaded', () => {
    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

    // Configuration - MODIFIEZ CES VALEURS SI BESOIN
    const COLLAPSE_THRESHOLD = 10;      // Nombre de docs avant de replier
    const INITIAL_VISIBLE = 5;          // Nombre de docs visibles initialement
    // =====================================

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
           
        }
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
                            const listDiv = document.createElement('div');
                            listDiv.className = 'item-list';

                            // Vérifie si collapsible
                            const shouldCollapse = subcat.files.length > COLLAPSE_THRESHOLD;
                            if (shouldCollapse) {
                                listDiv.classList.add('has-collapse');
                                listDiv.dataset.isExpanded = 'false';
                            }

                            subcat.files.forEach((fileEntry, index) => {
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
                                const isTemplate = flagsPart.includes('_t');

                                const link = document.createElement('a');
                                link.className = 'list-item file-entry';
                                link.href = `${cat.folder}/${subcat.name}/${cleanFileName}`;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';

                                // Marquer les items cachés au début
                                if (shouldCollapse && index >= INITIAL_VISIBLE) {
                                    link.classList.add('collapse-hidden');
                                }

                                applyCacheBuster(link.href, link);

                                const nameSpan = document.createElement('span');
                                nameSpan.className = 'item-name';
                                nameSpan.textContent = cleanFileName;
                                link.appendChild(nameSpan);

                                const iconsSpan = document.createElement('span');
                                iconsSpan.className = 'item-icons';

                                if (isProtected) {
                                    const protectedIcon = document.createElement('span');
                                    protectedIcon.className = 'icon icon-protected';
                                    iconsSpan.appendChild(protectedIcon);
                                }

                                link.appendChild(iconsSpan);
                                listDiv.appendChild(link);
                            });

                            // Crée le bouton de collapse s'il y a trop d'items
                            if (shouldCollapse) {
                                const collapseWrapper = document.createElement('div');
                                collapseWrapper.className = 'collapse-wrapper';

                                const collapseGradient = document.createElement('div');
                                collapseGradient.className = 'collapse-gradient';

                                const collapseButton = document.createElement('button');
                                collapseButton.className = 'collapse-button';
                                collapseButton.setAttribute('aria-label', 'Afficher plus');

                                const chevron = document.createElement('span');
                                chevron.className = 'chevron';
                                chevron.innerHTML = '▼';
                                collapseButton.appendChild(chevron);

                                collapseButton.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    toggleCollapse(listDiv, collapseButton);
                                });

                                collapseWrapper.appendChild(collapseGradient);
                                collapseWrapper.appendChild(collapseButton);
                                listDiv.appendChild(collapseWrapper);
                            }

                            subcatDiv.appendChild(listDiv);
                        }

                        catDiv.appendChild(subcatDiv);
                    });
                }

                container.appendChild(catDiv);
            });

            document.body.classList.add('loaded');

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            container.textContent = 'Erreur lors du chargement du contenu.';
        }
    }

    function toggleCollapse(listDiv, button) {
        const isExpanded = listDiv.dataset.isExpanded === 'true';
        const hiddenItems = listDiv.querySelectorAll('.collapse-hidden');

        if (!isExpanded) {
            // Expand
            hiddenItems.forEach(item => item.classList.remove('collapse-hidden'));
            listDiv.dataset.isExpanded = 'true';
            listDiv.classList.add('is-expanded');
            button.innerHTML = '<span class="chevron chevron-up">▼</span>';
            button.setAttribute('aria-label', 'Afficher moins');
        } else {
            // Collapse
            const fileEntries = listDiv.querySelectorAll('.file-entry');
            fileEntries.forEach((item, idx) => {
                if (idx >= INITIAL_VISIBLE) item.classList.add('collapse-hidden');
            });
            listDiv.dataset.isExpanded = 'false';
            listDiv.classList.remove('is-expanded');
            button.innerHTML = '<span class="chevron">▼</span>';
            button.setAttribute('aria-label', 'Afficher plus');
        }
    }

    loadContent();
});
