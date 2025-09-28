fetch('02_pc/pdf-list.json')
    .then(response => response.json())
    .then(files => {
        const listContainer = document.getElementById('pdf-list');
        files.forEach(file => {
            const link = document.createElement('a');
            link.href = `02_pc/${file}`;
            link.target = "_blank";
            link.textContent = file;
            link.className = 'pdf-item';
            listContainer.appendChild(link);
        });
    })
    .catch(err => {
        console.error('Erreur lors du chargement des PDFs:', err);
        document.getElementById('pdf-list').textContent = "Aucun PDF trouvé.";
    });
