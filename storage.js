/* Main storage object - contains all data persistence functions
 Other team members access these functions via window.BugStorage*/
const BugStorage = {
   
    issuesKey: 'bugTracker_issues',
    peopleKey: 'bugTracker_people',
    projectsKey: 'bugTracker_projects',
    adminKey: 'bugTracker_admin',
    //Prevents someone from adding a bug like <script>alert("hacked")</script> that could run malicious code.
    sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
},
    /*
     * Initializes localStorage with empty arrays if nothing exists
     * Called automatically when page loads
     * Prevents "undefined" errors when trying to read data
     */ 
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
         this.initAdmin(); 
    },
    // Generates ID's
/*
 * Get the next available ID for any item type
 * @param {Array} items - Array of existing items (issues, people, or projects)
 * @param {string} prefix - Prefix for the ID (BUG, PER, or PRJ)
 * @returns {string} Next available ID (example: "BUG-003")
 */
getNextId(items, prefix) {
    // If no items exist, start with 001
    if (items.length === 0) {
        return prefix + '-001';
    }
    
    let highestNumber = 0;
    
    // Loop through all existing items
    for (let i = 0; i < items.length; i++) {
        // Get the current item's ID (example: "BUG-003")
        let currentId = items[i].id;
        
        // Split by dash to get the number part
        // "BUG-003" becomes ["BUG", "003"]
        let parts = currentId.split('-');
        
        // Get the number part and convert to number
        // "003" becomes 3
        let currentNumber = parseInt(parts[1], 10);
        
        // Check if this number is bigger than what we have seen
        if (currentNumber > highestNumber) {
            highestNumber = currentNumber;
        }
    }
    
    // Add 1 to the highest number
    let nextNumber = highestNumber + 1;
    
    // Format number with leading zeros (001, 002, 010, 100)
    let formattedNumber;
    if (nextNumber < 10) {
        formattedNumber = '00' + nextNumber;  // 001, 002, 009
    } else if (nextNumber < 100) {
        formattedNumber = '0' + nextNumber;   // 010, 011, 099
    } else {
        formattedNumber = '' + nextNumber;     // 100, 101, 999
    }
    
    // Return the complete ID
    return prefix + '-' + formattedNumber;
},
    // Functions for the issues
    // Get all issues - returns array of all bug reports
    getAllIssues() {
        const data = localStorage.getItem(this.issuesKey);
        return data ? JSON.parse(data) : [];
    },
     // Find one issue by its ID - returns issue object or null
    getIssueById(id) {
        const issues = this.getAllIssues();
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id === id) return issues[i];
        }
        return null;
    },

    // Get admin from storage (retrieves admin object or returns null if none exists)
    getAdmin() {
    const data = localStorage.getItem(this.adminKey);
    return data ? JSON.parse(data) : null;
},
   // Save admin to storage (stores or updates the admin object in localStorage)
    setAdmin(adminData) {
    localStorage.setItem(this.adminKey, JSON.stringify(adminData));
},
   // Create default admin (runs on page load, creates default admin if none exists)
    initAdmin() {
        if (!localStorage.getItem(this.adminKey)) {
            const defaultAdmin = {
                id: "ADM-001",
                name: "System Administrator",
                email: "admin@bugtracker.com",
                role: "admin",
                password: "admin@123",
                permissions: ["view_all", "edit_all", "delete_all", "manage_users"]
            };
            localStorage.setItem(this.adminKey, JSON.stringify(defaultAdmin));
        }
    },

    // Add new issue - saves a bug report to storage
    //No status parameter! Status is always "open" for new issues
    addIssue(summary, description, priority, assignedTo, project,dueDate) {
    //Input Validation for security checks 
        if (!summary || summary.trim() === '') throw new Error('Summary is required');
        if (summary.length > 200) throw new Error('Summary too long (max 200 chars)');
        if (description.length > 2000) throw new Error('Description too long (max 2000 chars)');

        // // Get the date as "2026-04-17" (ISO format without time)
        const issues = this.getAllIssues();
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        
        const newIssue = {
        id: this.getNextId(issues,"BUG"), // format:"BUG-003"
        summary: this.sanitize(summary),      
        description: this.sanitize(description), 
        priority: this.sanitize(priority),// high, medium, low
        status: "open",  // Always starts as "open"
        assignedTo: this.sanitize(assignedTo),
        project: this.sanitize(project),
        date: date,
        dueDate: dueDate || null,          // Optional deadline
        fixedDate: null                    // Not fixed yet
        };
        // Adds to front so newest bugs show first
        issues.unshift(newIssue);
       // Save the updated issues array back to localStorage
        localStorage.setItem(this.issuesKey, JSON.stringify(issues));
        return newIssue;
    },
    // Update existing bug( modifies a bug's fields)
    //// Status is automatically calculated from dates
    updateIssue(id, updatedData) {
        const issues = this.getAllIssues();
        
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id === id) {
                // Update fields that were provided
                if (updatedData.summary !== undefined) issues[i].summary = updatedData.summary;
                if (updatedData.description !== undefined) issues[i].description = updatedData.description;
                if (updatedData.priority !== undefined) issues[i].priority = updatedData.priority;
                if (updatedData.assignedTo !== undefined) issues[i].assignedTo = updatedData.assignedTo;
                if (updatedData.project !== undefined) issues[i].project = updatedData.project;
                if (updatedData.dueDate !== undefined) issues[i].dueDate = updatedData.dueDate;
                if (updatedData.fixedDate !== undefined) issues[i].fixedDate = updatedData.fixedDate;
                
                // AUTO-CALCULATE STATUS (based on dates, NOT user input)
                if (issues[i].fixedDate) {
                    issues[i].status = "resolved";
                } else if (issues[i].dueDate && new Date(issues[i].dueDate) < new Date()) {
                    issues[i].status = "overdue";
                } else {
                    issues[i].status = "open";
                }
                localStorage.setItem(this.issuesKey, JSON.stringify(issues));
                return true;// Issue found
            }
        }
        return false;// Issue not found
    },
    // Deletes the bug(removes a bug from storage)
    deleteIssue(id) {
        let issues = this.getAllIssues();
        let newIssues = [];
        // Keep all issues except the one we to be deleted
        for (let i = 0; i < issues.length; i++) {
            if (issues[i].id !== id) {
                newIssues.push(issues[i]);
            }
        }
        
        localStorage.setItem(this.issuesKey, JSON.stringify(newIssues));
    },

     // markAsFixed (Sets today's date as fixedDate, status becomes "resolved")
    markAsFixed(id) {
        const today = new Date();
        const fixedDate = today.toISOString().split('T')[0];
        return this.updateIssue(id, { fixedDate: fixedDate });
    },
    
    // Functions for people
    // Gets all the people( returns array of all team members)
    getAllPeople() {
        const data = localStorage.getItem(this.peopleKey);
        return data ? JSON.parse(data) : [];
    },
    // Find person by ID( returns person object or null)
    getPersonById(id) {
        const people = this.getAllPeople();
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === id) return people[i];
        }
        return null;
    },
    // Add new person (saves a team member to storage)
    addPerson(name, surname, email, username) {
        const people = this.getAllPeople();
        const newPerson = {
            id: this.getNextId(people,"PER"), // "PER-002" format
            name: name,
            surname: surname,
            email: email,
            username: username
        };
        people.push(newPerson);
        localStorage.setItem(this.peopleKey, JSON.stringify(people));
        return newPerson;
    },
    // Update person (modifies a team member's information) 
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
    // Delete person(removes a team member from storage)
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
    // Get all projects (returns array of all projects)
    getAllProjects() {
        const data = localStorage.getItem(this.projectsKey);
        return data ? JSON.parse(data) : [];
    },
    // Find project by ID (returns project object or null)
    getProjectById(id) {
        const projects = this.getAllProjects();
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id === id) return projects[i];
        }
        return null;
    },
     // Add new project(saves a project to storage)
    addProject(name) {
        const projects = this.getAllProjects();
        const newProject = {
            id: this.getNextId(projects,"PRJ"),// "PRJ-001" format
            name: name
        };
        projects.push(newProject);
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
        return newProject;
    },
    // Update project( changes a project's name)
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


     // Delete project(removes a project from storage)
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
     // Get all issues assigned to a specific person name
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
    // Get all issues in a specific project name
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
    
    // Dashboard Statistics
     // Count issues by status :returns (total, open, resolved, overdue)
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
     // Count issues by priority:returns (high, medium, low)
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
    
    //Deletes EVERYTHING :issues, people, projects
    clearAllData() {
        localStorage.setItem(this.issuesKey, JSON.stringify([]));
        localStorage.setItem(this.peopleKey, JSON.stringify([]));
        localStorage.setItem(this.projectsKey, JSON.stringify([]));
        localStorage.setItem(this.adminKey, JSON.stringify([])); 
    }
};

// Used to make it available globally 
window.BugStorage = BugStorage;


document.addEventListener('DOMContentLoaded', function() {
    BugStorage.init();
    console.log('Bug Storage Ready!');
});
    







 

