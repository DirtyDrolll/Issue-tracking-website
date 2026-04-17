
 // Storage keys
const BugStorage = {
   
    issuesKey: 'bugTracker_issues',
    peopleKey: 'bugTracker_people',
    projectsKey: 'bugTracker_projects',
    //Prevents someone from adding a bug like <script>alert("hacked")</script> that could run malicious code.
    sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
},
    // Intializing empty storage 
    init() {
        if (!localStorage.getItem(this.issuesKey)) {
            localStorage.setItem(this.issuesKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.peopleKey)) {
            localStorage.setItem(this.peopleKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.projectsKey)) {
            localStorage.setItem(this.projectsKey, JSON.stringify([]));
        }
    },
    
    // Functions for the issues
    
    getAllIssues() {
        const data = localStorage.getItem(this.issuesKey);
        return data ? JSON.parse(data) : [];
    },
    
    getIssueById(id) {
        const issues = this.getAllIssues();
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id === id) return issues[i];
        }
        return null;
    },
    
    addIssue(summary, description, priority, status, assignedTo, project) {
    //Input Validation for security checks 
        if (!summary || summary.trim() === '') throw new Error('Summary is required');
        if (summary.length > 200) throw new Error('Summary too long (max 200 chars)');
        if (description.length > 2000) throw new Error('Description too long (max 2000 chars)');

        const issues = this.getAllIssues();
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        
        const newIssue = {
        id: this.getNextId(issues),
        summary: this.sanitize(summary),      
        description: this.sanitize(description), 
        priority: this.sanitize(priority),
        status: this.sanitize(status),
        assignedTo: this.sanitize(assignedTo),
        project: this.sanitize(project),
        date: date
        };
        
        issues.push(newIssue);
        localStorage.setItem(this.issuesKey, JSON.stringify(issues));
        return newIssue;
    },
    
    updateIssue(id, updatedData) {
        const issues = this.getAllIssues();
        
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id === id) {
                if (updatedData.summary !== undefined) issues[i].summary = updatedData.summary;
                if (updatedData.description !== undefined) issues[i].description = updatedData.description;
                if (updatedData.priority !== undefined) issues[i].priority = updatedData.priority;
                if (updatedData.status !== undefined) issues[i].status = updatedData.status;
                if (updatedData.assignedTo !== undefined) issues[i].assignedTo = updatedData.assignedTo;
                if (updatedData.project !== undefined) issues[i].project = updatedData.project;
                
                localStorage.setItem(this.issuesKey, JSON.stringify(issues));
                return true;
            }
        }
        return false;
    },
    
    deleteIssue(id) {
        let issues = this.getAllIssues();
        let newIssues = [];
        
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id !== id) {
                newIssues.push(issues[i]);
            }
        }
        
        localStorage.setItem(this.issuesKey, JSON.stringify(newIssues));
    },
    
    // Functions for people
    
    getAllPeople() {
        const data = localStorage.getItem(this.peopleKey);
        return data ? JSON.parse(data) : [];
    },
    
    getPersonById(id) {
        const people = this.getAllPeople();
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === id) return people[i];
        }
        return null;
    },
    
    addPerson(name, surname, email, username) {
        const people = this.getAllPeople();
        const newPerson = {
            id: this.getNextId(people),
            name: name,
            surname: surname,
            email: email,
            username: username
        };
        people.push(newPerson);
        localStorage.setItem(this.peopleKey, JSON.stringify(people));
        return newPerson;
    },
    
    updatePerson(id, updatedData) {
        const people = this.getAllPeople();
        
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === id) {
                if (updatedData.name !== undefined) people[i].name = updatedData.name;
                if (updatedData.surname !== undefined) people[i].surname = updatedData.surname;
                if (updatedData.email !== undefined) people[i].email = updatedData.email;
                if (updatedData.username !== undefined) people[i].username = updatedData.username;
                
                localStorage.setItem(this.peopleKey, JSON.stringify(people));
                return true;
            }
        }
        return false;
    },
    
    deletePerson(id) {
        let people = this.getAllPeople();
        let newPeople = [];
        
        for (let i = 0; i < people.length; i++) {
            if (people[i].id !== id) {
                newPeople.push(people[i]);
            }
        }
        
        localStorage.setItem(this.peopleKey, JSON.stringify(newPeople));
    },
    
    // Functions for projects 
    
    getAllProjects() {
        const data = localStorage.getItem(this.projectsKey);
        return data ? JSON.parse(data) : [];
    },
    
    getProjectById(id) {
        const projects = this.getAllProjects();
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id === id) return projects[i];
        }
        return null;
    },
    
    addProject(name) {
        const projects = this.getAllProjects();
        const newProject = {
            id: this.getNextId(projects),
            name: name
        };
        projects.push(newProject);
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
        return newProject;
    },
    
    updateProject(id, newName) {
        const projects = this.getAllProjects();
        
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id === id) {
                projects[i].name = newName;
                localStorage.setItem(this.projectsKey, JSON.stringify(projects));
                return true;
            }
        }
        return false;
    },
    
    deleteProject(id) {
        let projects = this.getAllProjects();
        let newProjects = [];
        
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id !== id) {
                newProjects.push(projects[i]);
            }
        }
        
        localStorage.setItem(this.projectsKey, JSON.stringify(newProjects));
    },
    
    // Assignment queries
    
    getIssuesByPerson(assignedTo) {
        const issues = this.getAllIssues();
        const result = [];
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].assignedTo === assignedTo) {
                result.push(issues[i]);
            }
        }
        return result;
    },
    
    getIssuesByProject(project) {
        const issues = this.getAllIssues();
        const result = [];
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].project === project) {
                result.push(issues[i]);
            }
        }
        return result;
    },
    
    // Statistics
    
    getStats() {
        const issues = this.getAllIssues();
        let total = 0, open = 0, resolved = 0, overdue = 0;
        
        for (let i = 0; i < issues.length; i++) {
            total++;
            if (issues[i].status === 'open') open++;
            if (issues[i].status === 'resolved') resolved++;
            if (issues[i].status === 'overdue') overdue++;
        }
        
        return { total, open, resolved, overdue };
    },
    
    getPriorityStats() {
        const issues = this.getAllIssues();
        let high = 0, medium = 0, low = 0;
        
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].priority === 'high') high++;
            if (issues[i].priority === 'medium') medium++;
            if (issues[i].priority === 'low') low++;
        }
        
        return { high, medium, low };
    },
    
    // Generates ID's
    
    getNextId(items) {
        if (items.length === 0) return 1;
        
        let biggestId = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id > biggestId) {
                biggestId = items[i].id;
            }
        }
        return biggestId + 1;
    },
    
    clearAllData() {
        localStorage.setItem(this.issuesKey, JSON.stringify([]));
        localStorage.setItem(this.peopleKey, JSON.stringify([]));
        localStorage.setItem(this.projectsKey, JSON.stringify([]));
    }
};

// Used to make it available globally 
window.BugStorage = BugStorage;


document.addEventListener('DOMContentLoaded', function() {
    BugStorage.init();
    console.log('Bug Storage Ready!');
});
    

BugStorage.addIssue('Persistence Test', 'Testing', 'high', 'open', 'Me', 'Test');
BugStorage.addIssue('Test 1', '', 'low', 'open', '', '');
BugStorage.addIssue('Test 2', '', 'low', 'open', '', '');
BugStorage.addIssue('Test 3', '', 'low', 'open', '', '');



