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
                                const fullUrl = new URL(filePath, window.location.href).href;

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

                                if (isProtected) {
                                    const protectedIcon = document.createElement('span');
                                    protectedIcon.className = 'icon icon-protected';
                                    protectedIcon.title = 'Fichier protégé par mot de passe';
                                    iconsContainer.appendChild(protectedIcon);
                                }
                                
                                 if (isDownloadable) {
                                        const downloadIcon = document.createElement('span');
                                        downloadIcon.className = 'icon icon-interactive icon-download'; // Utilise la nouvelle classe partagée
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
                                
                                    const linkIcon = document.createElement('span');
                                        linkIcon.className = 'icon icon-interactive icon-link'; // Utilise la nouvelle classe partagée
                                        linkIcon.title = 'Copier le lien';
                                    
                                        linkIcon.addEventListener('click', (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            navigator.clipboard.writeText(fullUrl).then(() => {
                                                const originalBg = linkIcon.style.backgroundColor;
                                                linkIcon.style.backgroundColor = 'var(--color-6)';
                                                setTimeout(() => {
                                                    linkIcon.style.backgroundColor = originalBg;
                                                }, 200);
                                            }).catch(err => {
                                                console.error('Erreur lors de la copie :', err);
                                            });
                                        });
                                        iconsContainer.appendChild(linkIcon);
                                
                                        link.appendChild(iconsContainer);
                                        listDiv.appendChild(link);
                                    });

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
