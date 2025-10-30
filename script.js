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

                                const parts = fileEntry.split('_');
                                const cleanFileName = parts[0];
                                const flags = parts.slice(1);

                                const isProtected = flags.includes('s');
                                const isDownloadable = flags.includes('t');

                                const link = document.createElement('a');
                                link.href = `${cat.folder}/${subcat.name}/${cleanFileName}`;
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
                                    link.setAttribute('download', '');
                                    const downloadIcon = document.createElement('span');
                                    downloadIcon.className = 'icon icon-download';
                                    iconsContainer.appendChild(downloadIcon);
                                }
                                
                                if (isProtected) {
                                    link.classList.add('is-protected');
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
});
