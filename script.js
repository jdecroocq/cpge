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
    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

    const THRESHOLD_FOR_COLLAPSE = 10;
    const INITIAL_VISIBLE_COUNT = 5;

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

                          
                            const shouldCollapse = subcat.files.length > THRESHOLD_FOR_COLLAPSE;
                            
                            if (shouldCollapse) {
                                listDiv.classList.add('collapsible-list');
                                listDiv.dataset.fullCount = subcat.files.length;
                                listDiv.dataset.visibleCount = INITIAL_VISIBLE_COUNT;
                                listDiv.dataset.isCollapsed = 'true';
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

                                const listItem = document.createElement('a');
                                listItem.className = 'list-item';
                                listItem.classList.add('file-item');
                                

                              if (shouldCollapse && index >= INITIAL_VISIBLE_COUNT) {
                                    listItem.classList.add('hidden-item');
                                }

                                const itemName = document.createElement('span');
                                itemName.className = 'item-name';
                                itemName.textContent = cleanFileName;
                                listItem.appendChild(itemName);

                                const itemIcons = document.createElement('div');
                                itemIcons.className = 'item-icons';

                                if (isProtected) {
                                    const protectedIcon = document.createElement('span');
                                    protectedIcon.className = 'icon icon-protected';
                                    itemIcons.appendChild(protectedIcon);
                                }

                                if (isTemplate) {
                                    const templateIcon = document.createElement('span');
                                    templateIcon.className = 'icon icon-template';
                                    itemIcons.appendChild(templateIcon);
                                }

                                const downloadIcon = document.createElement('span');
                                downloadIcon.className = 'icon icon-download';
                                itemIcons.appendChild(downloadIcon);

                                listItem.appendChild(itemIcons);

                                const baseUrl = `2526/${subcat.name}/${fileEntry}`;
                                listItem.href = baseUrl;
                                listItem.target = '_blank';
                                listItem.rel = 'noopener noreferrer';

                                applyCacheBuster(baseUrl, listItem);

                                listDiv.appendChild(listItem);
                            });

                            if (shouldCollapse) {
                                const expandBtn = document.createElement('button');
                                expandBtn.className = 'expand-button';
                                expandBtn.innerHTML = '<span class="expand-icon">▼</span>';
                                expandBtn.setAttribute('aria-label', 'Afficher tous les documents');
                                
                                expandBtn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    toggleListExpand(listDiv, expandBtn);
                                });

                                listDiv.appendChild(expandBtn);
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
            console.error('Erreur lors du chargement du contenu:', error);
            container.textContent = 'Erreur lors du chargement du contenu.';
        }
    }

    function toggleListExpand(listDiv, button) {
        const isCollapsed = listDiv.dataset.isCollapsed === 'true';
        const hiddenItems = listDiv.querySelectorAll('.hidden-item');

        if (isCollapsed) {

            hiddenItems.forEach(item => {
                item.classList.remove('hidden-item');
            });
            listDiv.dataset.isCollapsed = 'false';
            listDiv.classList.add('expanded');
            button.innerHTML = '<span class="expand-icon expand-icon-up">▲</span>';
            button.setAttribute('aria-label', 'Masquer les documents supplémentaires');
        } else {

            const visibleCount = parseInt(listDiv.dataset.visibleCount);
            const fileItems = listDiv.querySelectorAll('.file-item');
            
            fileItems.forEach((item, index) => {
                if (index >= visibleCount) {
                    item.classList.add('hidden-item');
                }
            });
            listDiv.dataset.isCollapsed = 'true';
            listDiv.classList.remove('expanded');
            button.innerHTML = '<span class="expand-icon">▼</span>';
            button.setAttribute('aria-label', 'Afficher tous les documents');
        }
    }

    loadContent();
});
