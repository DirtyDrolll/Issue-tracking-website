/*const issuesdata = BugStorage.getAllIssues();



const prioStats = BugStorage.getPriorityStats();
const lowprio = prioStats.low;
const mediumprio = prioStats.medium;
const highprio = prioStats.high;

document.addEventListener('DOMContentLoaded', function() {
    

    const prioStats = BugStorage.getPriorityStats();

    // Find the canvas element by its ID
    const ctx = document.getElementById('donut_chart').getContext('2d') ;


    // Define data
    const chartData = {
        labels: ['High Priority', 'Medium', 'Low'],
        datasets: [{
            label: 'Issues',
            data: [highprio, mediumprio, lowprio], // Example counts
            backgroundColor: [
                'rgb(202, 45, 124)', 
                'rgb(255, 199, 44)', 
                'rgb(45, 202, 163)'
            ],
            hoverOffset: 6.7
            
        }]
    };

    // Initialize the Chart
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // Positions labels at the bottom
                }
            },
            cutout: '67%' // Donut hole size
        }
    });
});



const totalCount = BugStorage.getAllIssues().length;
const openCount = BugStorage.getAllIssues().reduce((sum,count)=>{return count.status === 'open' ? sum + 1 : sum},0);
const resolvedCount = BugStorage.getAllIssues().reduce((sum,count)=>{return count.status === 'resolved' ? sum + 1 : sum},0);
const overdueCount = BugStorage.getAllIssues().reduce((sum,count)=>{return count.status === 'overdue' ? sum + 1 : sum},0);

function animateCounter(elementId, targetValue) {
    const displayElement = document.getElementById(elementId);
    let startValue = 0;
    
    // If the count is 0, just show "00" and stop
    if (targetValue === 0) {
        displayElement.innerHTML = "00";
        return;
    }

    // Fixed duration divided by targetValue 
    // This makes the speed feel consistent regardless of the number
    let intervalSpeed = Math.floor(2000 / targetValue);

    let timer = setInterval(() => {
        startValue += 1;
        
        // This adds the "0" if the number is less than 10
        displayElement.innerHTML = startValue < 10 ? "0" + startValue : startValue;

        // Stop the timer when we hit the target
        if (startValue >= targetValue) {
            clearInterval(timer);
        }
    }, intervalSpeed);
}

function prioDisplay(priority){

    const issuePrio = priority.toLowerCase()

    if (issuePrio === "high"){
        return 'prio-style prio-high' ;       
    }else if(issuePrio === "medium"){
        return 'prio-style prio-medium' ;
    }else if (issuePrio === "low"){
        return 'prio-style prio-low' ;
    }
        return 'prio-style' ;
}


function statusDisplay(status){

    const issueStatus = status.toLowerCase()

    if (issueStatus === "open"){
        return 'status-style status-open' ;       
    }else if(issueStatus === "resolved"){
        return 'status-style status-resolved' ;
    }else if (issueStatus === "overdue"){
        return 'status-style status-overdue' ;
    }
        return 'status-style' ;
}


function dynamicStats() {
    // Run the animation for each ID
    const stats = BugStorage.getStats();

    animateCounter('total-count', stats.total);
    animateCounter('open-count', stats.open);
    animateCounter('resolved-count', stats.resolved);
    animateCounter('overdue-count', stats.overdue);
}

// Call it when the page loads
dynamicStats();



const detailtablebody = document.getElementById('detailedIssuesTable');

function loadSummarisedTable() {
    const sumtableBody = document.getElementById('recentIssuesTable');
    if (!sumtableBody) return;

    const sumContainer = BugStorage.getAllIssues();
    let rowsHtml = ""; // Use a plural name to stay organized
    
    sumContainer.forEach(item => {
        const priostyle = prioDisplay(item.priority);
        const statusStyle =statusDisplay(item.status);

        rowsHtml += `<tr>
            <td>${item.summary}</td>
            <td>${item.project}</td>
            <td><span class="${priostyle}">${item.priority}</span></td>
            <td><span class="${statusStyle}">${item.status}</span></td>
            <td>${item.date}</td>
        </tr>`;
    });
    
    sumtableBody.innerHTML = rowsHtml; // Set it once at the 
    
}

document.addEventListener('DOMContentLoaded', () => {
    loadSummarisedTable();
});


function loadDetailedTable() {
    const detailtablebody = document.getElementById('detailedIssuesTable');
    if (!detailtablebody) return;

    detailtablebody.innerHTML = ""; 
    const issues = BugStorage.getAllIssues(); // Get real data

    issues.forEach(item => {
        const priostyle = prioDisplay(item.priority);
        const statusStyle =statusDisplay(item.status);

        let row = `<tr>
            <td><small class="text-muted">${item.id}</small></td>
            <td><strong>${item.summary}</strong></td>
            <td>${item.project}</td>               
            <td><span class="${priostyle}">${item.priority}</span></td>
            <td><span class="${statusStyle}">${item.status}</span></td>
            <td>
                <img src="https://ui-avatars.com/api/?name=${item.assignedTo}&background=random" 
                     style="width:24px; border-radius:50%; margin-right:5px;">
                ${item.assignedTo}
            </td>
            <td>${item.date}</td>
            <td><span class="text-dark">N/A</span></td> </tr>`;
        
        detailtablebody.innerHTML += row;
    });
}

loadDetailedTable();



const allsections = document.querySelectorAll('.view-section');//select all divs with that class so they can be hidden first in the fuction

function ViewPage(event,viewid){

    allsections.forEach(section => {
        section.classList.add('hidden');//hide all pages first
        
    });

    document.getElementById(viewid).classList.remove('hidden'); //removes the hide class on what ever was clicked in the nav bar


    // Remove 'active' from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add 'active' to the specific link that was clicked
    event.currentTarget.classList.add('active');
}

document.querySelector('#btn-dashboard').addEventListener('click',(e) => ViewPage(e,'dashboard-content'));
document.querySelector('#btn-issues').addEventListener('click',(e) => ViewPage(e,'issues-content'));
document.querySelector('#btn-people').addEventListener('click',(e) => ViewPage(e,'people-content'));
document.querySelector('#btn-projects').addEventListener('click',(e) => ViewPage(e,'projects-content'));



document.querySelector('.add-btn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('issueModal'));
    modal.show();
});



// form submit
const issueForm = document.getElementById('issueForm');

issueForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    const person = document.getElementById('person').value;
    const project = document.getElementById('project').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;

    try {
        BugStorage.addIssue(summary, description, priority, status, person, project);
        loadSummarisedTable();
        loadDetailedTable();
        dynamicStats();
        displayPopup("Issue Created Successfully!"); 
        issueForm.reset();

    } catch (err) {
        alert(err.message);
    }
});

// load data on page start
document.addEventListener('DOMContentLoaded', function() {
    loadTable();
});


function displayPopup(text){
    const message = document.getElementById('popup-message');
    const container = document.getElementById('popup-container');

    if (!container || !message) return;

    message.innerHTML = `<strong>${text}</strong>`;

    container.classList.add('show-popup');
    setTimeout(() => {
    container.classList.remove('show-popup');
        }, 3000);
    }

    document.addEventListener('DOMContentLoaded', function() {
        BugStorage.init();
        
        // Call the combined function here
        displayPopup("Bug Storage Ready!");
});*/

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

/* ==========================================
   2. DATA & TABLE RENDERING
   ========================================== */

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
    let rowsHtml = ""; 
    
    issues.forEach(item => {
        rowsHtml += `<tr>
            <td>${item.summary}</td>
            <td>${item.project}</td>
            <td><span class="${prioDisplay(item.priority)}">${item.priority}</span></td>
            <td><span class="${statusDisplay(item.status)}">${item.status}</span></td>
            <td>${item.date}</td>
        </tr>`;
    });
    sumtableBody.innerHTML = rowsHtml;
}

function loadDetailedTable() {
    const detailtablebody = document.getElementById('detailedIssuesTable');
    if (!detailtablebody) return;

    const issues = BugStorage.getAllIssues();
    detailtablebody.innerHTML = issues.map(item => `
        <tr>
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
            <td>
               <button class="btn btn-sm btn-success" onclick="markFixed('${item.id}')">
                 Mark Fixed
                </button>
             </td> 
        </tr>
    `).join('');
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
    displayPopup("Bug Storage Ready!");

    // 3. Navigation Listeners
    document.querySelector('#btn-dashboard').addEventListener('click', (e) => ViewPage(e, 'dashboard-content'));
    document.querySelector('#btn-issues').addEventListener('click', (e) => ViewPage(e, 'issues-content'));
    document.querySelector('#btn-people').addEventListener('click', (e) => ViewPage(e, 'people-content'));
    document.querySelector('#btn-projects').addEventListener('click', (e) => ViewPage(e, 'projects-content'));

    // 4. Modal Trigger
    document.querySelector('.add-btn').addEventListener('click', () => {
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
});

function markFixed(id) {
    BugStorage.markAsFixed(id);

    loadSummarisedTable();
    loadDetailedTable();
    dynamicStats();

    displayPopup("Issue marked as resolved!");
}
