

/* ==========================================
   1. UI HELPER FUNCTIONS
   ========================================== */

function prioDisplay(priority) {
    const issuePrio = priority.toLowerCase();
    if (issuePrio === "high") return 'prio-style prio-high';
    if (issuePrio === "medium") return 'prio-style prio-medium';
    if (issuePrio === "low") return 'prio-style prio-low';
    return 'prio-style';
}

function statusDisplay(status) {
    const issueStatus = status.toLowerCase();
    if (issueStatus === "open") return 'status-style status-open';
    if (issueStatus === "resolved") return 'status-style status-resolved';
    if (issueStatus === "overdue") return 'status-style status-overdue';
    return 'status-style';
}

function displayPopup(text) {
    const message = document.getElementById('popup-message');
    const container = document.getElementById('popup-container');
    if (!container || !message) return;

    message.innerHTML = `<strong>${text}</strong>`;
    container.classList.add('show-popup');
    setTimeout(() => {
        container.classList.remove('show-popup');
    }, 3000);
}

////////////////////////////////////////////
/*   2. DATA & TABLE RENDERING            */
///////////////////////////////////////////

function animateCounter(elementId, targetValue) {
    const displayElement = document.getElementById(elementId);
    if (!displayElement) return;
    
    let startValue = 0;
    if (targetValue === 0) {
        displayElement.innerHTML = "00";
        return;
    }

    let intervalSpeed = Math.floor(2000 / targetValue);
    let timer = setInterval(() => {
        startValue += 1;
        displayElement.innerHTML = startValue < 10 ? "0" + startValue : startValue;
        if (startValue >= targetValue) clearInterval(timer);
    }, intervalSpeed);
}

function dynamicStats() {
    const stats = BugStorage.getStats();
    animateCounter('total-count', stats.total);
    animateCounter('open-count', stats.open);
    animateCounter('resolved-count', stats.resolved);
    animateCounter('overdue-count', stats.overdue);
}

function loadSummarisedTable() {
    const sumtableBody = document.getElementById('recentIssuesTable');
    if (!sumtableBody) return;

    const issues = BugStorage.getAllIssues();
    
    sumtableBody.innerHTML = issues.map(item => 
       `<tr>
            <td>${item.summary}</td>
            <td>${item.project}</td>
            <td><span class="${prioDisplay(item.priority)}">${item.priority}</span></td>
            <td><span class="${statusDisplay(item.status)}">${item.status}</span></td>
            <td>${item.date}</td>
        </tr>`).join('');
}

function loadDetailedTable(data) {
    const detailtablebody = document.getElementById('detailedIssuesTable');
    if (!detailtablebody) return;

    const issues = data || BugStorage.getAllIssues();   
    detailtablebody.innerHTML = issues.map(item => 
       `<tr onclick="viewIssueDetails('${item.id}')" style="cursor: pointer;">
            <td><small class="text-muted">${item.id}</small></td>
            <td><strong>${item.summary}</strong></td>
            <td>${item.project}</td>               
            <td><span class="${prioDisplay(item.priority)}">${item.priority}</span></td>
            <td><span class="${statusDisplay(item.status)}">${item.status}</span></td>               
            <td>
                <img src="https://ui-avatars.com/api/?name=${item.assignedTo}&background=random" 
                     style="width:24px; border-radius:50%; margin-right:5px;">
                ${item.assignedTo}
            </td>
            <td>${item.date}</td>
            <td><span class="text-dark">${item.dueDate}</span></td> 
            <td><span class="text-dark">${item.fixedDate}</span></td> 
            <td>
               <button class="btn btn-sm btn-success" onclick="markFixed('${item.id}')">
                 Mark Fixed
                </button>
             </td> 
        </tr>`).join('');
}

/* ==========================================
   3. NAVIGATION & CHARTS
   ========================================= */

function ViewPage(event, viewid) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    document.getElementById(viewid).classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function initChart() {
    const ctx = document.getElementById('donut_chart')?.getContext('2d');
    if (!ctx) return;

    const stats = BugStorage.getPriorityStats();
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High Priority', 'Medium', 'Low'],
            datasets: [{
                data: [stats.high, stats.medium, stats.low],
                backgroundColor: ['rgb(202, 45, 124)', 'rgb(255, 199, 44)', 'rgb(45, 202, 163)'],
                hoverOffset: 6.7
            }]
        },
        options: { responsive: true, cutout: '67%' }
    });
}

/* ==========================================
   4. THE "COMMAND CENTER" (DOM LOADED)
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {

    // 1. Storage Init
    BugStorage.init();

    // 2. Initial Data Load
    loadSummarisedTable();
    loadDetailedTable();
    dynamicStats();
    initChart();
    loadPeopleList();
    loadProjectsList();
    displayPopup("Bug Storage Ready!");

    // 3. Navigation Listeners
    document.querySelector('#btn-dashboard').addEventListener('click', (e) => ViewPage(e, 'dashboard-content'));
    document.querySelector('#btn-issues').addEventListener('click', (e) => ViewPage(e, 'issues-content'));
    document.querySelector('#btn-people').addEventListener('click', (e) => ViewPage(e, 'people-content'));
    document.querySelector('#btn-projects').addEventListener('click', (e) => ViewPage(e, 'projects-content'));

    // 4. Modal Trigger
    document.querySelector('.add-btn').addEventListener('click', () => {
         populatePersonDropdown();   
         populateProjectDropdown(); 
        new bootstrap.Modal(document.getElementById('issueModal')).show();
    });

    // 5. Form Submission
    const issueForm = document.getElementById('modalIssueForm');

    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();

        const summary = issueForm.querySelector('#summary').value;
        const description = issueForm.querySelector('#description').value;
        const person = issueForm.querySelector('#person').value;
        const project = issueForm.querySelector('#project').value;
        const dueDate = issueForm.querySelector('#dueDate').value;
        const priority = issueForm.querySelector('#priority').value;
        const targetDate = issueForm.querySelector('#targetDate').value;

            try {
                BugStorage.addIssue(summary, description, priority, person, project, dueDate);

                loadSummarisedTable();
                loadDetailedTable();
                dynamicStats();

                displayPopup("Issue Created Successfully!");
                issueForm.reset();

            } catch (err) {
                alert(err.message);
            }
        });
    }

    const sortableHeaders = document.querySelectorAll('.sortable-header');

    sortableHeaders.forEach(header => {
        // Optional: make sure they look clickable
        header.style.cursor = 'pointer';

        header.addEventListener('click', function() {
            const column = this.dataset.column;
            const currentOrder = this.dataset.order;

            // Keep the toggle logic
            const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
            this.dataset.order = newOrder; // CSS detects this change instantly!

            // Keep the data fetching
            let issues = BugStorage.getAllIssues();

            // Keep the sorting logic
            issues.sort((a, b) => {
                let valA = a[column] ? a[column].toString().toLowerCase() : '';
                let valB = b[column] ? b[column].toString().toLowerCase() : '';
                const comparison = valA.localeCompare(valB);
                return newOrder === 'asc' ? comparison : comparison * -1;
            });
            // 6. Re-run your existing function to draw the table with the new order
            loadDetailedTable(issues);
        });
    });

    // load filter when the dates are changed
    document.getElementById('filter-date-start').addEventListener('change', applyAllFilters);
    document.getElementById('filter-date-end').addEventListener('change', applyAllFilters);

});

    // Person Form Submission
    const personForm = document.getElementById('personForm');
    if (personForm) {
        personForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('personName').value;
            const surname = document.getElementById('personSurname').value;
            const email = document.getElementById('personEmail').value;
            const username = document.getElementById('personUsername').value;

            //checks that all these fields have been filled in
            if (!name || !surname || !email || !username) {
                displayPopup("Please fill in all fields!");
                return;
            }
            //loads values into people list
            BugStorage.addPerson(name, surname, email, username);
            loadPeopleList();
            displayPopup("Person Added!");
            personForm.reset();
        });
    }

    // Project Form Submission
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('projectName').value;
            //checks that name is filled in
            if (!name) {
                displayPopup("Please enter a project name!");
                return;
            }
            
            BugStorage.addProject(name);
            loadProjectsList();
            displayPopup("Project Added!");
            projectForm.reset();//clears form and resets values
        });
    };

function markFixed(id) {
    BugStorage.markAsFixed(id);

    loadSummarisedTable();
    loadDetailedTable();
    dynamicStats();

    displayPopup("Issue marked as resolved!");
};
/* ==========================================
   5. PEOPLE & PROJECTS DISPLAY
   ========================================== */

//loads all people into a table
function loadPeopleList() {
    const peopleList = document.getElementById('peopleList');
    if (!peopleList) return;

    const people = BugStorage.getAllPeople();//gets people from locla storage
    //checks if it is empty and displays a message
    if (people.length === 0) {
        peopleList.innerHTML = '<div class="alert alert-info">No people added yet. Use the form above to add team members.</div>';
        return;
    }
    //table containing people
    peopleList.innerHTML = `
        <div class="table-container">
            <div class="table-scroll">
                <table class="table table-bordered">
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Surname</th><th>Email</th><th>Username</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${people.map(person => `
                            <tr>
                                <td><small>${person.id}</small></td>
                                <td>${person.name}</td>
                                <td>${person.surname}</td>
                                <td>${person.email}</td>
                                <td>${person.username}</td>
                                <td><button class="btn btn-sm btn-danger" onclick="deletePerson('${person.id}')">Delete</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
//loads all projects into a table
function loadProjectsList() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

//checks if projects are empty and returns a warning
    const projects = BugStorage.getAllProjects();
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<div class="alert alert-info">No projects added yet. Use the form above to add projects.</div>';
        return;
    }
    //projects table 
    projectsList.innerHTML = `
        <div class="table-container">
            <div class="table-scroll">
                <table class="table table-bordered">
                    <thead><tr><th>ID</th><th>Project Name</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${projects.map(project => `
                            <tr>
                                <td><small>${project.id}</small></td>
                                <td>${project.name}</td>
                                <td><button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">Delete</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
/* ==========================================
   6. SEED INITIAL DATA (from info.js)
   ========================================== */

function seedInitialData() {
    // Adds people from info file if the table is empty
    if (typeof people !== 'undefined' && BugStorage.getAllPeople().length === 0) {
        people.forEach(p => {
            BugStorage.addPerson(p.name, p.surname, p.email, p.username);
        });
        console.log("People seeded from info.js");
    }
    
    // Adds projects from info if the table is empty
    if (typeof project !== 'undefined' && BugStorage.getAllProjects().length === 0) {
        project.forEach(prj => {
            BugStorage.addProject(prj.name);
        });
        console.log("Projects seeded from info.js");
    }
}

// Deletes people and projects
window.deletePerson = function(id) {
    if (confirm('Delete this person?')) {
        BugStorage.deletePerson(id);
        loadPeopleList();
        displayPopup("Person Deleted!");
    }
};

window.deleteProject = function(id) {
    if (confirm('Delete this project?')) {
        BugStorage.deleteProject(id);
        loadProjectsList();
        displayPopup("Project Deleted!");
    }
};

/* ==========================================
   7. DROPDOWN POPULATION FOR ISSUE FORM
   ========================================== */

function populatePersonDropdown() {
    const personSelect = document.getElementById('person');
    if (!personSelect) return;
    
    const people = BugStorage.getAllPeople();
    
    personSelect.innerHTML = '<option value="">Select Assignee</option>';
    
    people.forEach(person => {
        const fullName = `${person.name} ${person.surname}`;
        const option = document.createElement('option');
        option.value = fullName;
        option.textContent = `${fullName} (${person.username})`;
        personSelect.appendChild(option);
    });
};

function populateProjectDropdown() {
    const projectSelect = document.getElementById('project');
    if (!projectSelect) return;
    
    const projects = BugStorage.getAllProjects();
    
    projectSelect.innerHTML = '<option value="">Select Project</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.name;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
};

/* ==========================================
   GLOBAL SEARCH & FILTER LOGIC
   ========================================== */

function applyAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const priorityFilter = document.getElementById('filter-priority').value;
    const statusFilter = document.getElementById('filter-status').value;
    const statDate=document.getElementById('filter-date-start').value;
    const endDate=document.getElementById('filter-date-end').value;

    
    // If the user is typing but isn't on the Issues page, switch views automatically
    const issuesPage = document.getElementById('issues-content');
    if (searchTerm.length > 0 && issuesPage.classList.contains('hidden')) {
        const issuesBtn = document.querySelector('#btn-issues');
        // This reuses existing ViewPage function
        ViewPage({ currentTarget: issuesBtn }, 'issues-content');
    }

    
        // 2. DATA FILTERING
    const allIssues = BugStorage.getAllIssues();

    const filtered = allIssues.filter(issue => {
        // Check Search Term (Fuzzy match on text)
        const matchesSearch = !searchTerm || 
                              issue.id.toLowerCase().includes(searchTerm) ||
                              issue.summary.toLowerCase().includes(searchTerm) || 
                              issue.project.toLowerCase().includes(searchTerm) ||
                              issue.assignedTo.toLowerCase().includes(searchTerm);
        
        // Check Priority (Exact match)
        const matchesPriority = (priorityFilter === 'all') || 
                                (issue.priority.toLowerCase() === priorityFilter.toLowerCase());
        
        // Check Status (Exact match)
        const matchesStatus = (statusFilter === 'all') || 
                              (issue.status.toLowerCase() === statusFilter.toLowerCase());


        let matchesDate = true;
                
                if (startDateValue || endDateValue) {
                    const issueDate = new Date(issue.date); // The bug's birthday
                    
                    if (startDateValue) {
                        const start = new Date(startDateValue);
                        if (issueDate < start) matchesDate = false; // does not display if its older
                    }
                    if (endDateValue) {
                        const end = new Date(endDateValue);
                        if (issueDate > end) matchesDate = false; // // does not display if its earlier
                    }
                }

                // only return true if it passes EVERY test
                return matchesSearch && matchesPriority && matchesStatus && matchesDate;
            });

    // render results
    loadDetailedTable(filtered);
}

// Listen for typing in the header
document.getElementById('searchInput').addEventListener('keyup', applyAllFilters);

// Listen for dropdown changes on the Issues page
document.getElementById('filter-priority').addEventListener('change', applyAllFilters);
document.getElementById('filter-status').addEventListener('change', applyAllFilters);

// Function to show the Details Card
function viewIssueDetails(issueId) {
    const issue = BugStorage.getAllIssues().find(i => i.id === issueId);
    if (!issue) return;

    // 1. Map Data to the specific display elements
    document.getElementById('viewId').innerText = issue.id;
    document.getElementById('viewSummary').innerText = issue.summary;
    document.getElementById('viewProject').innerText = issue.project;
    document.getElementById('viewAssignee').innerText = issue.assignedTo;
    document.getElementById('viewDescription').innerText = issue.description || "No description provided.";

    // 2. Status/Priority Badges (Reusing your awesome style functions)
    const sEl = document.getElementById('viewStatus');
    sEl.innerText = issue.status.toUpperCase();
    sEl.className = statusDisplay(issue.status); 

    const pEl = document.getElementById('viewPriority');
    pEl.innerText = issue.priority.toUpperCase();
    pEl.className = prioDisplay(issue.priority);

    // 3. Trigger ONLY the new View Modal
    const viewModal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
    viewModal.show();
}
