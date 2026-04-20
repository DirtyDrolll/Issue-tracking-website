
const ManagementSystem = {
    //extracts data from info.js into localStorage
    init() {
        const storedPeople = BugStorage.getAllPeople();
        const storedProjects = BugStorage.getAllProjects();

        // checks if people stored in the local storage is empty and that the information javascript has been loaded successfully
        if (storedPeople.length === 0 && typeof people !== 'undefined') {
            people.forEach(p => {
                this.addPerson(p.name, p.surname, p.email, p.username);
            });
        }

        // checks if projects stored in the local storage is empty 
        if (storedProjects.length === 0 && typeof project !== 'undefined') {
            project.forEach(prj => {
                this.addProject(prj.name);
            });
        }
        
        this.refreshAssignmentDropdowns(); //refreshes the people and project dropdowns 
    },

    // adding a new employee
    addPerson(name, surname, email, username) {
        const employees = BugStorage.getAllPeople();//loads stored employees
        
        // checks that the username is unique
        if (employees.some(p => p.username === username)) {
            console.warn("Username already exists.");
            return;
        }

        const addPerson = {
            id: BugStorage.getNextId(employees, 'Per'),//creates unique employeeId
            name: BugStorage.sanitize(name),
            surname: BugStorage.sanitize(surname),
            email: BugStorage.sanitize(email),
            username: BugStorage.sanitize(username)
        };

        employees.push(addPerson);
        localStorage.setItem(BugStorage.peopleKey, JSON.stringify(employees));
        this.refreshAssignmentDropdowns();//refreshes the dropdown
    },

    // adding a new project
    addProject(projectName) {
        const projects = BugStorage.getAllProjects();//loads stored projects
        
        const newProject = {
            id: BugStorage.getNextId(projects, 'PRJ'),
            name: BugStorage.sanitize(projectName)
        };

        projects.push(newProject);
        localStorage.setItem(BugStorage.projectsKey, JSON.stringify(projects));
        this.refreshAssignmentDropdowns();//refreshes the dropdown
    },

    // This connects the People and Projects to the Issue creation Form
    refreshAssignmentDropdowns() {
        const personSelect = document.getElementById('person');
        const projectSelect = document.getElementById('project');

        if (!personSelect || !projectSelect) return;//checks if dropdowns exist so an error doesn't occur

        const peopleData = BugStorage.getAllPeople();
        const projectData = BugStorage.getAllProjects();

        // Populates Person Dropdown
        personSelect.innerHTML = '<option value="" disabled selected>Select Assignee</option>';
        peopleData.forEach(p => {
            const option = document.createElement('option');
            option.value = p.username;
            option.textContent = `${p.name} ${p.surname}`;
            personSelect.appendChild(option);
        });

        // Populates Project Dropdown
        projectSelect.innerHTML = '<option value="" disabled selected>Select Project</option>';
        projectData.forEach(prj => {
            const option = document.createElement('option');
            option.value = prj.name;
            option.textContent = prj.name;
            projectSelect.appendChild(option);
        });
    }
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ManagementSystem.init();
});
// function that adds demo issues if no real issues have been loaded
function seedDemoIssues() {
    if (BugStorage.getAllIssues().length === 0) {
        const demoData = [
            ["Login Page CSS is broken", "Alignment is off in Chrome", "high", "open", "SAdams01", "Online Learning platform"],
            ["Database timeout", "Connection drops after 30 seconds", "medium", "resolved", "RMattews02", "Inventory System"],
            ["Mobile menu doesn't close", "Clicking X does nothing", "high", "overdue", "SChoi03", "Online Learning platform"],
            
        ];

        demoData.forEach(issue => {
            BugStorage.addIssue(...issue);
        });
        
        console.log("10 Demo issues seeded successfully.");//completed
        if(typeof loadSummarisedTable === 'function') loadSummarisedTable();
    }
};
