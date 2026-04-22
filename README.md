This is a single page application (SPA), so instead of having multiple html files we have everything in one html file stored in their own destinct <div>. The <div> will load on the web page depending on which navigation button you clicked. 
This is for display and performance reasons. 


## BugStorage Object

The BugStorage object manages all data storage for the bug tracker using the browser's localStorage API. It provides functions for saving, loading, updating, and deleting issues, people, projects and admin account with automatic status calculation and unique ID generation.

### What the BugStorage Object Does:

**Initialization**
* When the page loads, the **init()** function checks if data exists in localStorage
* If no data exists, empty arrays are created for issues, people, projects and admin
* A default admin account is automatically created with password "admin@123"
  
 **ID Generation**
* The **getNextId()** function generates unique IDs with prefixes
* Issues use format "BUG-001", people use "PER-001", projects use "PRJ-001"
* The function finds the highest existing number, adds one and formats with leading zeros

**Issue Management**
* **addIssue()** saves a new bug with summary, description, priority, assigned person, project and due date
* Status is NOT selected by users - new issues always start as "open"
* **getAllIssues()** retrieves all bugs from storage
* **updateIssue()** modifies existing bugs and auto-calculates status
* **deleteIssue()** removes a bug from storage
* **markAsFixed()** sets today's date as fixedDate and changes status to resolved

**Auto-Status Calculation**
* Status is automatically determined based on dates, not user input
* If **fixedDate** exists, status becomes "resolved"
* If no **fixedDate** and **dueDate** is in the past, status becomes "overdue"
* Otherwise, status remains "open"

**People Management**
* **addPerson()** saves team members with name, surname, email and username
* **getAllPeople()** retrieves all team members
* **updatePerson()** modifies existing person details
* **deletePerson()** removes a person from storage

**Project Management**
* **addProject()** saves a new project
* **getAllProjects()** retrieves all projects
* **updateProject()** changes a project name
* **deleteProject()** removes a project from storage

**Assignment Queries**
* **getIssuesByPerson()** finds all bugs assigned to a specific person
* **getIssuesByProject()** finds all bugs in a specific project

**Dashboard Statistics**
* **getStats()** returns counts for total, open, resolved and overdue issues
* **getPriorityStats()** returns counts for high, medium and low priority issues

**Admin Functions**
* **getAdmin()** retrieves the admin account from storage
* **setAdmin()** updates the admin account
* Default admin has permissions: view_all, edit_all, delete_all, manage_users

**Security Features**
* **sanitize()** prevents script injection by converting < and  > to HTML entities
* Input validation ensures summary is not empty and text length is within limits

**Data Persistence**
* All data is stored in the browser's localStorage using **JSON.stringify()**
* Data survives page refresh and browser restarts
* Storage keys used: **bugTracker_issues**, **bugTracker_people**, **bugTracker_projects**, **bugTracker_admin**

