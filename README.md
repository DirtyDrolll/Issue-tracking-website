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

## Issue Management System (SPA)

The Issue Management System is a single-page application built using HTML, CSS, and JavaScript. It manages all bug tracking functionality inside one page without reloading, allowing users to navigate between sections dynamically.

### What the Issue Management System Does:

**Navigation System**
* Allows switching between Dashboard, Issues, People, and Projects  
* Uses JavaScript (`ViewPage()` function) to show and hide sections dynamically  
* Ensures only one section is visible at a time for a clean interface  

**Issue Management (Core Functionality)**
* Users can create new issues using a modal form  
* Issues can be edited using the edit function (`dataset.editId` system)  
* Issues can be marked as fixed or resolved  
* Issues are displayed in both summary and detailed tables  

**Search, Filter & Sorting**
* Users can search issues by ID, summary, project, or assigned person  
* Filters allow sorting by priority, status, and date range  
* Table columns can be sorted in ascending or descending order  

**Dashboard Features**
* Displays live statistics (total, open, resolved, overdue issues)  
* Uses animated counters for better visual feedback  
* Shows a priority distribution chart using Chart.js  

**People & Projects Management**
* Users can add and delete people (team members)  
* Users can add and delete projects  
* Dropdowns are dynamically populated when creating issues  

**Notifications & UI Feedback**
* Popup messages display success or error feedback  
* Visual badges show priority and status styling  
* User actions update the UI instantly without refresh  

**Data Storage**
* All data is stored using browser localStorage via the BugStorage system  
* No backend is required  
* Data persists even after page refresh  

### How It Works:

**Initialization**
* When the page loads, all data is loaded from localStorage  
* Tables, charts, and counters are rendered automatically  
* Navigation and event listeners are attached in `DOMContentLoaded`  

**User Interaction Flow**
* Users navigate using the sidebar menu  
* Issues are created, updated, or filtered in real time  
* All changes instantly update the UI and storage  
* Dashboard updates automatically based on stored data

### Projects Management Features

**Add Project**
* Single field: Project Name
* Click "Add Project" to save
* Prevents adding empty project names

**Display Projects**
* Table format with columns:
  * ID (auto-generated, format: PRJ-001)
  * Project Name
  * Delete button for all entries
* Empty state message when no projects exist

**Delete Project**
* Confirmation dialog before deletion
* Removes project from storage
* Existing issues retain the project name (no cascade delete)

### Assignment Logic (Issue Form Integration)

**Dynamic Dropdown Population**
* When creating/editing an issue, the "Assigned To" and "Project" fields are **dropdown menus**, not text inputs
* Dropdowns are automatically populated from existing people and projects
* Prevents typos and ensures every issue links to valid team members and projects

**Functions:**
* `populatePersonDropdown()` – loads all people into the Assignee dropdown
* `populateProjectDropdown()` – loads all projects into the Project dropdown
* Called when:
  * Opening the "New Ticket" modal
  * Adding a new person/project (updates dropdowns instantly with new values)

### Data Seeding (info.js)

**Purpose**
* Provides default data on first load or after clearing localStorage to prevent an empty database

**What Gets Seeded:**
* **People (5 default team members):**
  * Samantha Adams, Ronald Matthews, Steven Choi, Ellen Swanepoel, Dennis Randall
* **Projects (4 default projects):**
  * Online Learning platform
  * Event management system
  * Website Redesign
  * Cloud File storage platform

**How It Works:**
* `seedInitialData()` runs after `BugStorage.init()`
* Checks if people/projects arrays are empty before seeding
* Only seeds if `typeof people !== 'undefined'` (info.js loaded)
* Console logs confirm successful seeding

### Table Styling (People & Projects)

**Visual Design**
* Rounded corners (border-radius: 20px)
* Soft shadow for depth
* Clean white background
* Sticky headers that stay visible while scrolling

**Header Styling**
* Blue gradient background
* Uppercase text with letter spacing
* Left-aligned text for better readability

**Row Styling**
* Hover effect (background color changes)
* Alternating subtle borders
* Delete buttons styled in dark blue with rounded corners

**Responsive Behavior**
* Horizontal scroll on small screens (overflow-x: auto)
* Text wraps within cells (word-wrap: break-word)
* Max-width prevents over-expanding columns

### Integration Points

**How Features depend on each other**
* Issue creation form dropdowns require people and projects to exist
* Filtering by project/assignee requires valid data
* Dashboard statistics indirectly rely on proper assignment

**Dependencies:**
* Requires `BugStorage` object (addPerson, addProject, deletePerson, deleteProject methods)
* Uses `loadPeopleList()` and `loadProjectsList()` from app.js
* info.js must be loaded before seedInitialData() runs


