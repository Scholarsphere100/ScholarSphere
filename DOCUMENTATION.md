# 📚 Scholarsphere - Documentation

## 📖 Overview

**Scholarsphere** is a web-based university research collaboration platform designed to help academics find collaborators, manage shared research resources, and track project progress. The platform supports roles for Researchers, Reviewers, and Admins.

It is developed using **Agile methodology**, with a **Test-Driven Development (TDD)** approach and includes **CI/CD pipelines** to ensure continuous integration and delivery.

---

## 🚀 Features

- 📝 Post and manage research projects
- 👥 Invite collaborators and assign roles
- 📩 Built-in messaging system
- 📁 Document sharing
- 🗓 Milestone and progress tracking
- 💰 Funding and grant tracking
- 📊 Exportable dashboard reports (CSV or PDF)
- 🔍 Admin dashboard for user approval
- 🤖 AI-powered collaborator recommendations *(coming soon)*

---

## 🛠️ Tech Stack

| Layer           | Technologies Used                          |
|-----------------|--------------------------------------------|
| Backend         | Node.js,                                   |
| Database        | Firebase Firestore                         |
| Authentication  | Firebase Authentication (Google OAuth)     |
| Hosting         | Microsoft Azure                            |
| Testing         | Jest, Supertest                            |
| CI/CD           | GitHub Actions                             |
| Version Control | Git + GitHub                               |

---

## 🧪 Testing Approach (TDD)

The team follows a **Test-Driven Development** methodology. This means writing unit/integration test cases before implementing features.

**Testing Tools:**
- `Jest` for unit and functional tests
- `Supertest` for API endpoint testing  // To  be edited as time goes on

Each user story has defined test cases written before implementation to validate:
- Authentication and role restrictions
- Proper API request/response structure
- Database side effects (user creation, status updates, etc.)

---

# User Stories and Acceptance Tests - Sprint 1

## User Story 1: Admin Login  
**As an admin, I want to be able to log in to an admin dashboard, so that I can manage the platform efficiently.**  

### Acceptance Tests:  
1. **Given** I am an admin,  
   **When** I enter valid credentials and log in,  
   **Then** I am redirected to the admin dashboard.  

2. **Given** I am on the admin dashboard,  
   **When** I view the interface,  
   **Then** I see options to manage users, projects, and platform settings.  

3. **Given** I am an admin,  
   **When** I enter invalid credentials,  
   **Then** I see an error message and remain on the login page.  

---

## User Story 2: Approve/Reject Pending Users  
**As an admin, I want to be able to approve or reject pending researchers and reviewers, so that I can ensure only verified users access the system.**  

### Acceptance Tests:  
1. **Given** I am logged in as an admin,  
   **When** I navigate to the "Pending Users" section,  
   **Then** I see a list of researchers and reviewers awaiting approval.  

2. **Given** I am viewing a pending user’s profile,  
   **When** I click "Approve,"  
   **Then** the user’s status updates to "Approved," and they receive a confirmation notification.  

3. **Given** I am viewing a pending user’s profile,  
   **When** I click "Reject,"  
   **Then** the user’s status updates to "Rejected," and they receive a rejection notification.  

---

## User Story 3: Researcher Sign-Up with Third-Party Auth  
**As a researcher, I want to sign up with a third-party identity provider and receive a pending status notification, so that I can securely access the platform once approved.**  

### Acceptance Tests:  
1. **Given** I am a new researcher,  
   **When** I sign up using Google,  
   **Then** I receive an email/notification: "Your account is pending admin approval."  

2. **Given** my account is pending,  
   **When** an admin approves it,  
   **Then** I receive a notification: "Your account is approved," and I can log in.  

3. **Given** my account is pending,  
   **When** an admin rejects it,  
   **Then** I receive a notification: "Your account was rejected," and I cannot log in.  

4. **Given** I try to log in while my account is pending,  
   **When** I enter my credentials,  
   **Then** I see a message: "Account pending approval. Please wait."  

---

## User Story 4: Reviewer Sign-Up with Third-Party Auth  
**As a reviewer, I want to sign up with a third-party identity provider and receive a pending status notification, so that I can securely access the platform once approved.**  

### Acceptance Tests:  
1. **Given** I am a new reviewer,  
   **When** I sign up using Google,  
   **Then** I receive an email/notification: "Your account is pending admin approval."  

2. **Given** my account is pending,  
   **When** an admin approves it,  
   **Then** I receive a notification: "Your account is approved," and I can log in.  

3. **Given** my account is pending,  
   **When** an admin rejects it,  
   **Then** I receive a notification: "Your account was rejected," and I cannot log in.  

4. **Given** I try to log in while my account is pending,  
   **When** I enter my credentials,  
   **Then** I see a message: "Account pending approval. Please wait."

   ---

  # User Stories and User Acceptance Tests - Sprint 2

## User Story 5: Create Research Project Listing  
**As a researcher, I want to create a research project listing with details like objectives, required skills, and timeline, so that potential collaborators can find and join my project.**  

### Acceptance Tests:  
1. **Given** I am logged in as a researcher,  
   **When** I fill in all required fields (title, objectives, required skills, timeline) and submit the form,  
   **Then** the project is created and displayed in the projects list.  

2. **Given** I am logged in as a researcher,  
   **When** I submit the form without filling in required fields,  
   **Then** I see validation errors and the project is not created.  

3. **Given** I have created a project,  
   **When** I view the project details,  
   **Then** I see all the information I entered (objectives, skills, timeline, etc.).  

---

## User Story 6: Browse and Search Research Projects  
**As a researcher, I want to browse and search for existing research projects, so that I can find projects that align with my expertise.**  

### Acceptance Tests:  
1. **Given** I am logged in as a researcher,  
   **When** I navigate to the projects page,  
   **Then** I see a list of available research projects.  

2. **Given** I am on the projects page,  
   **When** I enter a keyword in the search bar and submit,  
   **Then** I see only projects matching my search query.  

3. **Given** I am browsing projects,  
   **When** I filter by required skills or timeline,  
   **Then** I only see projects that match my selected filters.  

---

## User Story 7: Send Collaboration Requests  
**As a researcher, I want to send collaboration requests to other researchers and reviewers, so that I can invite them to join my project.**  

### Acceptance Tests:  
1. **Given** I am viewing a researcher’s profile or my project dashboard,  
   **When** I click "Send Collaboration Request,"  
   **Then** a request is sent, and the recipient is notified.  

2. **Given** I am logged in as a researcher,  
   **When** I try to send a request to someone already invited,  
   **Then** I see a message that a request is already pending.  

3. **Given** I am logged in as a researcher,  
   **When** I send a request,  
   **Then** I see a confirmation that the request was sent successfully.  

---

## User Story 8: Receive and Respond to Collaboration Requests  
**As a researcher or reviewer, I want to receive and respond to collaboration requests, so that I can accept or decline invitations to join projects.**  

### Acceptance Tests:  
1. **Given** I have received a collaboration request,  
   **When** I open my notifications,  
   **Then** I see the request details and options to accept or decline.  

2. **Given** I am viewing a collaboration request,  
   **When** I click "Accept,"  
   **Then** I am added to the project, and the requester is notified.  

3. **Given** I am viewing a collaboration request,  
   **When** I click "Decline,"  
   **Then** the request is closed, and the requester is notified.  

---

## User Story 9: Reviewer View-Only Access  
**As a reviewer, I want to have view-only access to research projects with comment-only privileges, so that I can provide feedback without modifying core project data or metadata.**  

### Acceptance Tests:  
1. **Given** I am logged in as a reviewer,  
   **When** I open a research project,  
   **Then** I can see all project details but cannot edit them.  

2. **Given** I am a reviewer on a project,  
   **When** I try to edit a field,  
   **Then** I see a message that I do not have permission.  

3. **Given** I am a reviewer,  
   **When** I add a comment to the project,  
   **Then** the comment is saved and visible to project members.  

---

## User Story 10: Notifications for Collaboration Requests  
**As a researcher, I want to receive notifications when my collaboration request is accepted/rejected, so that I can proceed accordingly.**  

### Acceptance Tests:  
1. **Given** I sent a collaboration request,  
   **When** the recipient accepts it,  
   **Then** I receive a notification saying my request was accepted.  

2. **Given** I sent a collaboration request,  
   **When** the recipient declines it,  
   **Then** I receive a notification saying my request was declined.  

3. **Given** I receive a notification about my request,  
   **When** I click on it,  
   **Then** I am redirected to the relevant project or message.

# User Stories and User Acceptance Tests - Sprint 3

## User Story 11: Project Milestones  
**As a researcher,**  
**I want to define and track project milestones,**  
**So that I can monitor progress effectively.**  

### Acceptance Tests:  
1. **Given** I am logged in as a researcher,  
**When** I navigate to the "Milestones" section of my project,  
**Then** I can create, edit, and delete milestones with due dates and descriptions.  

2. **Given** I have set a milestone,  
**When** the due date passes,  
**Then** I receive a notification about the overdue milestone.  

3. **Given** I have multiple milestones,  
**When** I view the project dashboard,  
**Then** I see a progress bar or visual indicator of completed vs. pending milestones.  

---

## User Story 12: Share Documents with Collaborators  
**As a researcher,**  
**I want to share documents and resources with my collaborators,**  
**So that we can work together efficiently.**  

### Acceptance Tests:  
1. **Given** I am in a project's "Documents" section,  
**When** I upload a file and share it with a collaborator,  
**Then** they receive a notification and can access the file.  

2. **Given** I set a document to "View-only" for a collaborator,  
**When** they attempt to edit it,  
**Then** the system blocks the action and displays a permissions error.  

3. **Given** a shared document has multiple versions,  
**When** I check the version history,  
**Then** I can see who modified it and when.  

---

## User Story 13: Built-in Messaging  
**As a researcher or reviewer,**  
**I want to use built-in messaging to communicate with collaborators,**  
**So that we can discuss project details securely.**  

### Acceptance Tests:  
1. **Given** I am on a project page,  
**When** I click "Message Collaborators,"  
**Then** a chat window opens where I can send/receive real-time messages.  

2. **Given** I receive a new message,  
**When** I am not actively viewing the chat,  
**Then** I see a notification badge on the messaging icon.  

3. **Given** I send a message with a file attachment,  
**When** the collaborator opens it,  
**Then** the file renders correctly without errors.  

---

## User Story 14: Track Grant Funding & Expenses  
**As a researcher,**  
**I want to track grant funding and expenses,**  
**So that I can manage my project budget effectively.**  

### Acceptance Tests:  
1. **Given** I navigate to the "Grants" section,  
**When** I input a grant amount and link it to my project,  
**Then** the system calculates remaining funds after each expense entry.  

2. **Given** I add an expense,  
**When** I categorize it (e.g., equipment, travel),  
**Then** the dashboard updates pie charts/spend analytics automatically.  

3. **Given** I exceed 80% of my grant budget,  
**When** I check the funding tab,  
**Then** I see a warning alert for near-depletion.  

---

## User Story 15: Manage Grant Requirements  
**As a researcher,**  
**I want to manage grant funding requirements,**  
**So that I can manage my project budget effectively.**  

### Acceptance Tests:  
1. **Given** I have an active grant,  
**When** I view its terms in the system,  
**Then** I see deadlines, reporting rules, and compliance notes.  

2. **Given** a grant requires quarterly reports,  
**When** the due date approaches,  
**Then** I receive a reminder notification 14 days in advance.  

3. **Given** I mark a requirement as "Completed",  
**When** I check the grant status,  
**Then** it reflects updated progress (e.g., "3/5 tasks done").  

---

## User Story 16: Project Completion Report (Admin)  
**As an admin,**  
**I want to generate a project completion status report,**  
**So that I can analyze platform efficiency.**  

### Acceptance Tests:  
1. **Given** I am logged in as an admin,  
**When** I run a "Completion Report" for a date range,  
**Then** the system exports a PDF/CSV with % completion per project.  

2. **Given** a report includes overdue projects,  
**When** I filter by "Delayed",  
**Then** I see reasons logged by researchers (e.g., "awaiting ethics approval").  

3. **Given** I generate a report,  
**When** I select "All Active Projects",  
**Then** the data includes milestones, collaborator counts, and last activity dates.

 # User Stories and User Acceptance Tests - Sprint 4

## User Story 17: Funding Report  
**As an admin**,  
I want to generate a funding report (used vs. available),  
So that I can monitor financial activity.  

**Acceptance Tests:**  
1. **Given** I am logged in as an admin,  
**When** I navigate to the "Financial Reports" section,  
**Then** I can generate a report showing used vs. available funding for all projects.  

2. **Given** I generate a funding report,  
**When** I view the report,  
**Then** it clearly distinguishes between allocated, used, and remaining funds.  

3. **Given** a project has no financial activity,  
**When** I generate the funding report,  
**Then** it displays zero usage and full availability for that project.  

---

## User Story 18: Custom Report  
**As an admin**,  
I want to view a custom report,  
So that I can make data-driven decisions.  

**Acceptance Tests:**  
1. **Given** I am logged in as an admin,  
**When** I select "Create Custom Report" from the dashboard,  
**Then** I can choose from multiple data fields (e.g., projects, users, funding).  

2. **Given** I select filters for my report,  
**When** I generate the report,  
**Then** it only includes data matching my selected criteria.  

3. **Given** I generate a custom report,  
**When** I try to export it,  
**Then** I can download it in at least two formats (e.g., PDF, CSV).  

---

## User Story 19: Remove Collaborators  
**As a researcher**,  
I want to be able to remove collaborators in my research project.  

**Acceptance Tests:**  
1. **Given** I am the owner of a research project,  
**When** I navigate to the "Collaborators" section,  
**Then** I can see a list of all current collaborators with a "Remove" option.  

2. **Given** I select to remove a collaborator,  
**When** I confirm the action,  
**Then** the collaborator loses access to the project and receives a notification.  

3. **Given** I am not the project owner,  
**When** I try to remove a collaborator,  
**Then** the system displays an "Access Denied" message.  

---

## User Story 20: Last Login Status  
**As an admin**,  
I want to be able to check the last login status of users,  
So that I can deactivate people who have not been active for 6 months or more.  

**Acceptance Tests:**  
1. **Given** I am logged in as an admin,  
**When** I view the "User Management" dashboard,  
**Then** I can see each user's last login date and status (Active/Inactive).  

2. **Given** a user has not logged in for over 6 months,  
**When** I check their status,  
**Then** the system flags them as "Eligible for Deactivation."  

3. **Given** I select to deactivate an inactive user,  
**When** I confirm the action,  
**Then** their account is deactivated, and they receive an email notification.  

4. **Given** a deactivated user tries to log in,  
**When** they enter their credentials,  
**Then** they see a message explaining their account is deactivated.  


## 🧑‍💻 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/lesedilengosane/Bb-SD-Projekt.git
cd scholarsphere
