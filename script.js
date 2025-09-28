const categories = [
    { 
        name: "TSI 1",
        folder: "1",
        json: "1/pdf-list.json"
    },
    { 
        name: "TSI 2",
        folder: "2",
        json: "2/pdf-list.json"
    }
];

const container = document.getElementById('pdf-container');

categories.forEach(cat => {
    fetch(cat.json)
        .then(res => res.json())
        .then(matieres => {
            const catDiv = document.createElement('div');
            catDiv.className = 'pdf-category';
            
            const catTitle = document.createElement('h2');
            catTitle.textContent = cat.name;
            catDiv.appendChild(catTitle);
            
            matieres.forEach(matiere => {
                const matDiv = document.createElement('div');
                const matTitle = document.createElement('h3');
                matTitle.textContent = matiere.name;
                matDiv.appendChild(matTitle);

                const listDiv = document.createElement('div');
                listDiv.className = 'pdf-list';

                matiere.files.forEach(file => {
                    const link = document.createElement('a');
                    link.href = `${cat.folder}/${file}`;
                    link.target = "_blank";
                    link.textContent = file;
                    link.className = 'pdf-item';
                    listDiv.appendChild(link);
                });

                matDiv.appendChild(listDiv);
                catDiv.appendChild(matDiv);
            });

            container.appendChild(catDiv);
        })
        .catch(err => console.error("Erreur chargement PDFs:", err));
});
