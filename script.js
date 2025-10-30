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
                                // --- DÉBUT DE LA LOGIQUE CORRIGÉE ---

                                let cleanFileName = fileEntry;
                                let flagsPart = '';

                                // 1. On cherche le dernier point pour trouver l'extension.
                                const lastDotIndex = fileEntry.lastIndexOf('.');
                                // On s'assure qu'il y a une extension et que ce n'est pas un fichier caché (ex: .htaccess)
                                if (lastDotIndex > 0) {
                                    // 2. On cherche le premier underscore APRÈS l'extension.
                                    const firstFlagIndex = fileEntry.indexOf('_', lastDotIndex);
                                    
                                    if (firstFlagIndex > -1) {
                                        // 3. Si on trouve un underscore, on sépare le nom de fichier et les indicateurs.
                                        cleanFileName = fileEntry.substring(0, firstFlagIndex);
                                        flagsPart = fileEntry.substring(firstFlagIndex);
                                    }
                                }

                                // 4. On vérifie la présence des indicateurs dans la partie extraite.
                                const isProtected = flagsPart.includes('_s');
                                const isDownloadable = flagsPart.includes('_t');

                                // 5. On crée le lien avec le nom de fichier désormais correct.
                                const link = document.createElement('a');
                                link.href = `${cat.folder}/${subcat.name}/${cleanFileName}`;
                                link.target = "_blank";
                                link.rel = "noopener noreferrer";
                                link.className = 'list-item';

                                // 6. Créer des conteneurs pour le texte et les icônes
                                const fileNameSpan = document.createElement('span');
                                fileNameSpan.className = 'item-name';
                                fileNameSpan.textContent = cleanFileName; // On affiche le nom de fichier correct.
                                link.appendChild(fileNameSpan);

                                const iconsContainer = document.createElement('span');
                                iconsContainer.className = 'item-icons';

                                // 7. Gérer l'attribut de téléchargement et l'icône
                                if (isDownloadable) {
                                    link.setAttribute('download', '');
                                    const downloadIcon = document.createElement('span');
                                    downloadIcon.className = 'icon icon-download';
                                    iconsContainer.appendChild(downloadIcon);
                                }
                                
                                // 8. Gérer la classe pour le cadenas
                                if (isProtected) {
                                    const protectedIcon = document.createElement('span');
                                    protectedIcon.className = 'icon icon-protected';
                                    iconsContainer.appendChild(protectedIcon);
                                }

                                if (iconsContainer.hasChildNodes()) {
                                    link.appendChild(iconsContainer);
                                }

                                // --- FIN DE LA LOGIQUE CORRIGÉE ---

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
});
