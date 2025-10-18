document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('pdf-container');

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
                catDiv.className = 'pdf-category';

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
                        subcatDiv.className = 'pdf-matiere';
                        
                        const subcatTitle = document.createElement('h3');
                        subcatTitle.textContent = subcat.name;
                        subcatDiv.appendChild(subcatTitle);

                        const listDiv = document.createElement('div');
                        listDiv.className = 'pdf-list';

                        if (!subcat.files || subcat.files.length === 0) {
                            const emptyMsg = document.createElement('p');
                            emptyMsg.className = 'empty-message';
                            emptyMsg.textContent = 'Cette sous-catégorie ne contient aucun document.';
                            listDiv.appendChild(emptyMsg);
                        } else {
                            subcat.files.forEach(file => {
                                const link = document.createElement('a');
                                link.href = `${cat.name}/${subcat.name}/${file}`;
                                link.target = "_blank";
                                link.rel = "noopener noreferrer";
                                link.textContent = file;
                                link.className = 'pdf-item';
                                listDiv.appendChild(link);
                            });
                        }
                        subcatDiv.appendChild(listDiv);
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
