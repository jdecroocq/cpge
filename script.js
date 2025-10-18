document.addEventListener('DOMContentLoaded', async () => {
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
                catTitle.textContent = cat.name;
                catDiv.appendChild(catTitle);

                if (!cat.subcategories || cat.subcategories.length === 0) {
                    const emptyMsg = document.createElement('p');
                    emptyMsg.className = 'empty-message';
                    emptyMsg.textContent = 'Cette catégorie ne contient aucune sous-catégorie.';
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
                            emptyMsg.textContent = 'Cette sous-catégorie ne contient aucun document.';
                            subcatDiv.appendChild(emptyMsg);
                        } else {
                            const listDiv = document.createElement('div');
                            listDiv.className = 'item-list';

                            subcat.files.forEach(file => {
                                const link = document.createElement('a');
                                link.href = `${cat.name}/${subcat.name}/${file}`;
                                link.target = "_blank";
                                link.rel = "noopener noreferrer";
                                link.textContent = file;
                                link.className = 'list-item';

                                const fileNameWithoutExt = file.substring(0, file.lastIndexOf('.'));
                                if (fileNameWithoutExt.endsWith('_s')) {
                                    link.classList.add('is-protected');
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
        }
    }

    loadContent();
});
