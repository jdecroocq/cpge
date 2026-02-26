(function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        document.documentElement.classList.toggle('dark-mode');
        const isDark = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#000000' : '#ffffff');
      });
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
    const mainPageBody = document.getElementById('main-page');
    if (!mainPageBody) return;

    const container = document.getElementById('content-container');

    const DOC_EXTENSIONS   = ['pdf','doc','docx','xls','xlsx','ppt','pptx','odt','ods','odp','epub','pages','numbers','key'];
    const CODE_EXTENSIONS  = ['py','js','ts','jsx','tsx','json','html','htm','css','c','cpp','h','hpp','java','sh','bash','txt','md','rb','go','rs','php','sql','yaml','yml','xml','csv','vue','svelte','kt','swift','r','lua','pl','scala','dart','ex','exs','hs','ml','f90','f95','asm','s','toml','ini','env','dockerfile','makefile'];
    const PHOTO_EXTENSIONS = ['jpg','jpeg','png','gif','webp','svg','bmp','tiff','tif','avif','heic','heif','ico','raw','cr2','nef','arw','rw2','dng','exr'];

    function getExtension(name) {
        const parts = name.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    function getTypeIconClass(entry) {
        if (typeof entry === 'object' && entry !== null) {
            if (entry.type === 'flashcard') return 'icon-type-flashcard';
            return 'icon-type-link';
        }
        let cleanName = entry;
        const lastDot = entry.lastIndexOf('.');
        if (lastDot > 0) {
            const flagIdx = entry.indexOf('_', lastDot);
            if (flagIdx > -1) cleanName = entry.substring(0, flagIdx);
        }
        const ext = getExtension(cleanName);
        if (DOC_EXTENSIONS.includes(ext))   return 'icon-type-file';
        if (CODE_EXTENSIONS.includes(ext))  return 'icon-type-code';
        if (PHOTO_EXTENSIONS.includes(ext)) return 'icon-type-photo';
        return 'icon-type-file';
    }

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
        } catch (error) {}
    }

    async function loadContent() {
        try {
            const response = await fetch('list.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
                                const link = document.createElement('a');
                                link.className = 'list-item';
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';

                                const typeIcon = document.createElement('span');
                                typeIcon.className = `icon item-type-icon ${getTypeIconClass(fileEntry)}`;
                                link.appendChild(typeIcon);

                                if (typeof fileEntry === 'object' && fileEntry !== null && fileEntry.url) {
                                    link.href = fileEntry.url;

                                    const nameSpan = document.createElement('span');
                                    nameSpan.className = 'item-name';
                                    nameSpan.textContent = fileEntry.name || fileEntry.url;
                                    link.appendChild(nameSpan);

                                    listDiv.appendChild(link);
                                    return;
                                }

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

                                const isProtected   = flagsPart.includes('_s');
                                const isDownloadable = flagsPart.includes('_t');
                                const filePath = `${cat.folder}/${subcat.name}/${cleanFileName}`;

                                link.href = filePath;
                                link.dataset.finalUrl = filePath;
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
            setTimeout(() => {
                mainPageBody.classList.add('loaded');
            }, 300);
        }
    }

    loadContent();

    const concoursDate = new Date("2027-04-26");

    function getDaysLeft(targetDate) {
        const now = new Date();
        const utcNow    = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        return Math.floor((utcTarget - utcNow) / (1000 * 60 * 60 * 24));
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

    function updateGreeting() {
        const greetingEl = document.getElementById("greeting");
        if (!greetingEl) return;
        const hour = new Date().getHours();
        greetingEl.textContent = (hour >= 4 && hour < 18) ? "Bonjour" : "Bonsoir";
    }

    updateGreeting();
});
