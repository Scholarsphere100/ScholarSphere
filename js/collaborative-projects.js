// collaborative-projects.js

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
    authDomain: "scholarsphere-a8c83.firebaseapp.com",
    projectId: "scholarsphere-a8c83",
    storageBucket: "scholarsphere-a8c83.firebasestorage.app",
    messagingSenderId: "841487458923",
    appId: "1:841487458923:web:b171e7057ae763fcb1472e",
    measurementId: "G-NNYQ7E1KY2"
};

// Initialize Firebase only once
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', async () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Check if user is authenticated
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log('User not authenticated. Redirecting to login...');
            // Redirect to login page
            // window.location.href = '../html/login.html';
            return;
        }
        
        try {
            // First, determine if we're on my-projects or assigned-projects page
            const isMyProjectsPage = window.location.pathname.includes('my-projects');
            const isAssignedProjectsPage = window.location.pathname.includes('assigned-projects');
            
            if (!isMyProjectsPage && !isAssignedProjectsPage) {
                console.log('Not on a projects page. Exiting...');
                return;
            }
            
            // Get user data to determine role - using the same approach as search.js
            const userDoc = await db.collection('Users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                console.error('User document not found');
                return;
            }
            
            const userData = userDoc.data();
            
            // Determine if user is a researcher or reviewer based on isResearcher and isReviewer fields
            const isResearcher = userData.isResearcher === true;
            const isReviewer = userData.isReviewer === true;
            
            console.log(`User roles - Researcher: ${isResearcher}, Reviewer: ${isReviewer}`);
            
            // Check if we're on the correct page for this user's role
            if ((isReviewer && isMyProjectsPage) || 
                (!isReviewer && isAssignedProjectsPage)) {
                console.log(`User with roles (Researcher: ${isResearcher}, Reviewer: ${isReviewer}) is on the wrong page.`);
                // Redirect to the correct page based on role
                // window.location.href = isReviewer ? '../html/assigned-projects.html' : '../html/my-projects.html';
                return;
            }
            
            // Get projects where user is a collaborator
            const projectsRef = db.collection('projects');
            const projectsSnapshot = await projectsRef.where('collaborators', 'array-contains', user.uid).get();
            
            // Also get projects where user is the owner (createdBy field)
            const ownedProjectsSnapshot = await projectsRef.where('createdBy', '==', user.uid).get();
            
            // Combine the results (removing duplicates)
            const projectIds = new Set();
            const allProjects = [];
            
            // Process collaborative projects
            projectsSnapshot.forEach(doc => {
                if (!projectIds.has(doc.id)) {
                    projectIds.add(doc.id);
                    allProjects.push({
                        id: doc.id,
                        ...doc.data(),
                        isOwner: doc.data().createdBy === user.uid
                    });
                }
            });
            
            // Process owned projects
            ownedProjectsSnapshot.forEach(doc => {
                if (!projectIds.has(doc.id)) {
                    projectIds.add(doc.id);
                    allProjects.push({
                        id: doc.id,
                        ...doc.data(),
                        isOwner: true
                    });
                }
            });
            
            console.log(`Found ${allProjects.length} projects for user ${user.uid}`);
            
            // Clear existing projects
            const projectsGrid = document.querySelector('.projects-grid');
            if (projectsGrid) {
                projectsGrid.innerHTML = '';
            } else {
                console.error('Projects grid not found in the DOM');
                return;
            }
            
            // Render projects based on page type
            if (isMyProjectsPage) {
                renderResearcherProjects(allProjects, projectsGrid);
            } else {
                renderReviewerProjects(allProjects, projectsGrid, user.uid);
            }
            
        } catch (error) {
            console.error('Error loading collaborative projects:', error);
        }
    });
    
    // Render projects for researcher view (my-projects.html)
    function renderResearcherProjects(projects, container) {
        if (projects.length === 0) {
            container.innerHTML = '<p class="no-projects">You have no projects yet. Create a new project to get started.</p>';
            return;
        }
        
        projects.forEach(project => {
            // Format dates
            const endDate = project.endDate ? formatDate(project.endDate) : 'No due date';
            const lastUpdated = getLastUpdatedText(project.updatedAt);
            
            // Count collaborators
            const collaboratorsCount = project.collaborators ? project.collaborators.length : 0;
            
            // Create project element
            const projectElement = document.createElement('li');
            projectElement.className = 'project-item';
            projectElement.innerHTML = `
                <article class="research-project">
                    <h2>${project.title || 'Untitled Project'}</h2>
                    <p>${project.description || 'No description provided.'}</p>
    
                    <section class="project-meta-section">
                        <p class="meta-item">
                            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                            <time datetime="${project.endDate}">Due: ${endDate}</time>
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            ${collaboratorsCount} Collaborator${collaboratorsCount !== 1 ? 's' : ''}
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            Last updated: ${lastUpdated}
                        </p>
                    </section>
    
                    <section class="project-progress">
                        <header class="progress-header">
                            <h3>Progress</h3>
                            <p>${project.progress || 0}%</p>
                        </header>
                        <progress value="${project.progress || 0}" max="100">${project.progress || 0}%</progress>
                    </section>
    
                    <a href="../html/project-details.html?id=${project.id}" class="project-action-btn">
                        ${project.isOwner ? 'Manage Project' : 'View Project'}
                    </a>
                </article>
            `;
            
            container.appendChild(projectElement);
        });
    }
    


    // Render projects for reviewer view (assigned-projects.html)
    function renderReviewerProjects(projects, container, userId) {
        if (projects.length === 0) {
            container.innerHTML = '<p class="no-projects">You have no assigned projects to review yet.</p>';
            return;
        }
        
        projects.forEach(project => {
            // Format dates
            const endDate = project.endDate ? formatDate(project.endDate) : 'No due date';
            const lastUpdated = getLastUpdatedText(project.updatedAt);
            
            // Count collaborators
            const collaboratorsCount = project.collaborators ? project.collaborators.length : 0;
            
            // Create project element
            const projectElement = document.createElement('li');
            projectElement.className = 'project-item';
            projectElement.innerHTML = `
                <article class="research-project reviewer-project">
                    <h2>${project.title || 'Untitled Project'}</h2>
                    <p>${project.description || 'No description provided.'}</p>

                    <section class="project-meta-section">
                        <p class="meta-item">
                            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                            <time datetime="${project.endDate}">Due: ${endDate}</time>
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            ${collaboratorsCount} Collaborator${collaboratorsCount !== 1 ? 's' : ''}
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            Last updated: ${lastUpdated}
                        </p>
                    </section>

                    <section class="project-progress">
                        <header class="progress-header">
                            <h3>Progress</h3>
                            <p>${project.progress || 0}%</p>
                        </header>
                        <progress value="${project.progress || 0}" max="100">${project.progress || 0}%</progress>
                    </section>

                    <div class="reviewer-actions">
                        <a href="../html/project-review.html?id=${project.id}&mode=review" class="project-action-btn review-btn">
                            <i class="fas fa-clipboard-check"></i> Review Project
                        </a>
                    </div>
                </article>
            `;
            
            container.appendChild(projectElement);
        });
    }

    // Helper function to format dates
    function formatDate(dateString) {
        try {
            // Handle Firestore Timestamp objects
            if (dateString && typeof dateString.toDate === 'function') {
                const date = dateString.toDate();
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                return date.toLocaleDateString('en-US', options);
            }
            
            // Handle string dates
            if (typeof dateString === 'string') {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const options = { month: 'short', day: 'numeric', year: 'numeric' };
                    return date.toLocaleDateString('en-US', options);
                }
            }
            
            return 'No due date';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'No due date';
        }
    }
    
    // Helper function to get "last updated" text
    function getLastUpdatedText(timestamp) {
        if (!timestamp) return 'Never';
        
        let date;
        if (typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
});