document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Find the canvas element by its ID
    const ctx = document.getElementById('donut_chart').getContext('2d') ;

    // 2. Define data
    const chartData = {
        labels: ['High Priority', 'Medium', 'Low'],
        datasets: [{
            label: 'Issues',
            data: [5, 12, 7], // Example counts
            backgroundColor: [
                'rgb(202, 45, 124)', 
                'rgb(255, 199, 44)', 
                'rgb(45, 202, 163)'
            ],
            hoverOffset: 6.7
            
        }]
    };

    // 3. Initialize the Chart
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
            cutout: '67%' // Donut hole
        }
    });
});



const tableBody = document.getElementById('recentIssuesTable');

const dummyData = [
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Fix Login", proj: "Web", prio: "High", stat: "Open", date: "Oct 12" },
    { name: "Update CSS", proj: "UI", prio: "Low", stat: "Closed", date: "Oct 15" }
];

function loadTable() {
    tableBody.innerHTML = ""; 
    dummyData.forEach(item => {
        let row = `<tr>
            <td>${item.name}</td>
            <td>${item.proj}</td>
            <td>${item.prio}</td>
            <td>${item.stat}</td>
            <td>${item.date}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

loadTable();



const allsections = document.querySelectorAll('.view-section');//select all divs with that class so they can be hidden first in the fuction

function ViewPage(event,viewid){

    allsections.forEach(section => {
        section.classList.add('hidden');//hide all pages first
        
    });

    document.getElementById(viewid).classList.remove('hidden'); //removes the hide class on what ever was clicked in the nav bar


    // 2. Remove 'active' from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // 3. Add 'active' to the specific link that was clicked
    event.currentTarget.classList.add('active');
}

document.querySelector('#btn-dashboard').addEventListener('click',(e) => ViewPage(e,'dashboard-content'));
document.querySelector('#btn-issues').addEventListener('click',(e) => ViewPage(e,'issues-content'));
document.querySelector('#btn-people').addEventListener('click',(e) => ViewPage(e,'people-content'));
document.querySelector('#btn-projects').addEventListener('click',(e) => ViewPage(e,'projects-content'));

