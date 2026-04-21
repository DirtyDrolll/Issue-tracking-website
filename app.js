const issuesdata = BugStorage.getAllIssues();



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
            <td>
              <button class="btn btn-sm btn-warning" onclick="editIssue('${item.id}')">
               Edit
               </button>
            </td>
             </tr>`;
        
        detailtablebody.innerHTML += row;
    });
}

loadDetailedTable();

function editIssue(id) {
    const issues = BugStorage.getAllIssues();
    const issue = issues.find(item => item.id === id);

    if (!issue) return;

    document.getElementById('summary').value = issue.summary;
    document.getElementById('description').value = issue.description;
    document.getElementById('person').value = issue.assignedTo;
    document.getElementById('project').value = issue.project;
    document.getElementById('status').value = issue.status;
    document.getElementById('priority').value = issue.priority;

    document.getElementById('issueModalForm').setAttribute('data-edit-id', id);

    const modal = new bootstrap.Modal(document.getElementById('issueModal'));
    modal.show();
}

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
let editingId = null;
const issueForm = document.getElementById('issueModalForm');

issueForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    const person = document.getElementById('person').value;
    const project = document.getElementById('project').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;

    try {
        if (editingId) {
            BugStorage.updateIssue(editingId, {
                summary,
                description,
                priority,
                status,
                assignedTo: person,
                project
            });
            displayPopup("Issue Updated Successfully!");
            editingId = null;
        } else {
            BugStorage.addIssue(summary, description, priority, status, person, project);
            displayPopup("Issue Created Successfully!");
        }

        loadSummarisedTable();
        loadDetailedTable();
        dynamicStats();
        issueForm.reset();

    } catch (err) {
        alert(err.message);
    }
});

// load data on page start
document.addEventListener('DOMContentLoaded', function() {
    loadSummarisedTable();
    loadDetailedTable();
function editIssue(id) {
    const issues = BugStorage.getAllIssues();
    const issue = issues.find(i => i.id === id);

    if (!issue) return;

    document.getElementById('summary').value = issue.summary;
    document.getElementById('description').value = issue.description;
    document.getElementById('person').value = issue.assignedTo;
    document.getElementById('project').value = issue.project;
    document.getElementById('status').value = issue.status;
    document.getElementById('priority').value = issue.priority;

    editingId = id;

    const modal = new bootstrap.Modal(document.getElementById('issueModal'));
    modal.show();
}
    
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
});
