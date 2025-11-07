let syllabus = {};
let filteredData = {};

// Load syllabus JSON file
async function loadSyllabus() {
    try {
        const res = await fetch('./NMSyllabus.json');
        syllabus = await res.json();
        console.log('JSON file loaded successfully');
        populateSubjects();
    } catch (err) {
        console.error(`This is error...\n${err}`);
    }
}

// Populate Subject Dropdown
function populateSubjects() {
    const subjectSelect = document.getElementById('subjectSelect');
    subjectSelect.innerHTML = `<option value="">-- All Subjects --</option>`;
    Object.keys(syllabus).forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

// Populate Categories based on Subject
function populateCategories(subject) {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = `<option value="">-- All Categories --</option>`;

    if (!subject) {
        categorySelect.disabled = true;
        return;
    }

    const categories = Object.keys(syllabus[subject] || {});
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    categorySelect.disabled = false;
}

// Apply Filters
function applyFilter() {
    const subject = document.getElementById('subjectSelect').value;
    const category = document.getElementById('categorySelect').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    const viewType = document.getElementById('viewSelect').value;

    filteredData = {};

    Object.keys(syllabus).forEach(sub => {
        if (subject && sub !== subject) return;

        filteredData[sub] = {};
        Object.keys(syllabus[sub]).forEach(cat => {
            if (category && cat !== category) return;

            let topics = syllabus[sub][cat];
            if (!Array.isArray(topics)) topics = [topics]; // Ensure array

            const matched = topics.filter(t =>
                t.toLowerCase().includes(search)
            );

            if (matched.length) filteredData[sub][cat] = matched;
        });
    });

    displayResults(viewType);
}

// Display Results
function displayResults(viewType) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    if (Object.keys(filteredData).length === 0) {
        container.innerHTML = `<p class="text-center text-muted">No results found.</p>`;
        return;
    }

    if (viewType === 'cards') {
        for (const sub in filteredData) {
            const subDiv = document.createElement('div');
            subDiv.className = 'mb-4';

            const subjectHeader = document.createElement('h4');
            subjectHeader.textContent = sub;
            subDiv.appendChild(subjectHeader);

            for (const cat in filteredData[sub]) {
                const card = document.createElement('div');
                card.className = 'card mb-3 shadow-sm';

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                const title = document.createElement('h5');
                title.className = 'card-title';
                title.textContent = cat;
                cardBody.appendChild(title);

                const list = document.createElement('ul');
                list.className = 'list-group list-group-flush';
                filteredData[sub][cat].forEach(topic => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = topic;
                    list.appendChild(li);
                });

                cardBody.appendChild(list);
                card.appendChild(cardBody);
                subDiv.appendChild(card);
            }

            container.appendChild(subDiv);
        }
    } else {
        // TABLE VIEW
        const table = document.createElement('table');
        table.className = 'table table-bordered table-striped';
        const thead = document.createElement('thead');
        thead.innerHTML = `<tr><th>Subject</th><th>Category</th><th>Topic</th></tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        for (const sub in filteredData) {
            for (const cat in filteredData[sub]) {
                filteredData[sub][cat].forEach(topic => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${sub}</td><td>${cat}</td><td>${topic}</td>`;
                    tbody.appendChild(tr);
                });
            }
        }

        table.appendChild(tbody);
        container.appendChild(table);
    }
}



// Event Listeners
document.getElementById('subjectSelect').addEventListener('change', e => {
    populateCategories(e.target.value);
});

document.getElementById('btnApplyFilter').addEventListener('click', applyFilter);
document.getElementById('btnExpandAll').addEventListener('click', expandAll);
document.getElementById('btnCollapseAll').addEventListener('click', collapseAll);
document.getElementById('btnExport').addEventListener('click', exportFilteredJSON);
document.getElementById('viewSelect').addEventListener('change', () => {
    const viewType = document.getElementById('viewSelect').value;
    displayResults(viewType);
});

// Initialize
loadSyllabus();
