document.addEventListener('DOMContentLoaded', () => {
    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

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

document.addEventListener('DOMContentLoaded', () => {
    const qaContainer = document.querySelector('.quick-actions-container');
    const qaHighlight = document.getElementById('qa-highlight');
    const qaItems = document.querySelectorAll('.qa-item');

    if (qaContainer && qaHighlight && qaItems.length > 0) {
        
        const moveHighlight = (targetItem, animate = true) => {
            const containerRect = qaContainer.getBoundingClientRect();
            const itemRect = targetItem.getBoundingClientRect();
            const leftPos = itemRect.left - containerRect.left;

            qaHighlight.style.width = `${itemRect.width}px`;
            qaHighlight.style.height = `${itemRect.height}px`;

            if (!animate) {
                qaHighlight.style.transition = 'none';
                qaHighlight.style.transform = `translateX(${leftPos}px)`;
                void qaHighlight.offsetWidth; 
                qaHighlight.style.opacity = '1';
            } else {
                qaHighlight.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.2s ease';
                qaHighlight.style.transform = `translateX(${leftPos}px)`;
                qaHighlight.style.opacity = '1';
            }
        };

        let isHovering = false;

        qaItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (!isHovering) {
                    moveHighlight(item, false);
                    isHovering = true;
                } else {
                    moveHighlight(item, true);
                }
            });
        });

        qaContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            qaHighlight.style.opacity = '0';
        });
    }

    const forceExternalLinks = document.querySelectorAll('a[data-force-external="true"]');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isPWA) {
        forceExternalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                let targetUrl = link.href;
                window.open(targetUrl, '_blank');
            });
        });
    }
});
