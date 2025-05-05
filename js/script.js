
import { auth, db } from './search.js';


document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const notificationButton = document.getElementById('notification-button');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationModal = document.getElementById('close-notification-modal');
    
    const createProjectBtn = document.getElementById('create-project-btn');
    const dashboardCreateProjectBtn = document.getElementById('dashboard-create-project-btn');
    const createProjectModal = document.getElementById('create-project-modal');
    const closeProjectModal = document.getElementById('close-project-modal');
    
    const findProjectsBtn = document.getElementById('find-projects-btn');
    
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchResultItems = document.querySelectorAll('.search-result-item');
    const searchClear = document.getElementById('search-clear');
    const searchWrapper = document.querySelector('.search-wrapper');
    
    const uploadDocumentBtn = document.getElementById('upload-document-btn');
    const uploadDocumentModal = document.getElementById('upload-document-modal');
    const closeUploadModal = document.getElementById('close-upload-modal');
    const documentFileInput = document.getElementById('document-file');
    const selectedFileName = document.getElementById('selected-file-name');

    const searchableItems = [
        { title: 'Quantum Computing Applications', type: 'project' },
        { title: 'Neural Network Optimization', type: 'project' },
        { title: 'Climate Data Analysis', type: 'project' },
        { title: 'Sustainable Energy Solutions', type: 'project' },
        { title: 'AI Ethics Framework', type: 'project' },
        { title: 'Dr. Jane Smith', type: 'researcher' },
        { title: 'Dr. Michael Chen', type: 'researcher' },
        { title: 'Dr. Lisa Wong', type: 'researcher' }
    ];
    
    // Open sidebar
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('sidebar-open');
        });
    }
    
    // Close sidebar
    function closeSidebarFunc() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarFunc);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebarFunc);
    }
    
    // Show notification modal
    if (notificationButton) {
        notificationButton.addEventListener('click', function() {
            notificationModal.classList.add('active');
        });
    }
    
    // Close notification modal
    if (closeNotificationModal) {
        closeNotificationModal.addEventListener('click', function() {
            notificationModal.classList.remove('active');
        });
    }
    
    // Show create project modal from sidebar
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', function() {
            createProjectModal.classList.add('active');
        });
    }
    
    // Show create project modal from dashboard
    if (dashboardCreateProjectBtn) {
        dashboardCreateProjectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createProjectModal.classList.add('active');
        });
    }
    
    // Close create project modal
    if (closeProjectModal) {
        closeProjectModal.addEventListener('click', function() {
            createProjectModal.classList.remove('active');
        });
    }
    
    // Find Projects button functionality - focus search input
    if (findProjectsBtn && searchInput) {
        findProjectsBtn.addEventListener('click', function() {
            searchInput.focus();
            if (searchResults) {
                searchResults.classList.add('active');
            }
        });
    }
    

    // Search functionality
    if (searchInput && searchResults) {
        // Show search results on focus
        searchInput.addEventListener('focus', function() {
            searchResults.classList.add('active');
            
            // If there's already text in the input, perform search
            if (this.value.length > 0) {
                performSearch(this.value);
            }
        });
    
        // Filter results as user types
        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                performSearch(this.value);
            } else {
                // Show recent searches when input is empty
                showRecentSearches();
            }
        });
    
        // Function to perform search and display results
        function performSearch(query) {
            // Clear previous results
            const resultsContainer = document.querySelector('.search-results-list');
            resultsContainer.innerHTML = '';
            
            // Update header
            document.querySelector('.search-results-header h3').textContent = 'Search Results';
            
            // Filter items based on query
            const filteredItems = searchableItems.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            
            if (filteredItems.length > 0) {
                // Add filtered items to results
                filteredItems.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'search-result-item';
                    
                    // Choose icon based on item type
                    const iconClass = item.type === 'project' ? 'fa-file-alt' : 'fa-user';
                    
                    li.innerHTML = `
                        <i class="fas ${iconClass}"></i>
                        <p>${item.title}</p>
                    `;
                    
                    li.addEventListener('click', function() {
                        searchInput.value = item.title;
                        searchResults.classList.remove('active');
                    });
                    
                    resultsContainer.appendChild(li);
                });
            } else {
                // Show no results message
                const li = document.createElement('li');
                li.className = 'search-result-item no-results';
                li.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                `;
                resultsContainer.appendChild(li);
            }
        }
    
        // Function to show recent searches
        function showRecentSearches() {
            // Update header
            document.querySelector('.search-results-header h3').textContent = 'Recent Searches';
            
            // You can implement loading recent searches from localStorage here
            // For now, we'll keep the existing static recent searches
        }
    }

    if (searchInput && searchClear) {
        // Check if there's initial content in the search input
        if (searchInput.value.length > 0) {
            searchWrapper.classList.add('has-text');
        }
        
        // Update on input
        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                searchWrapper.classList.add('has-text');
            } else {
                searchWrapper.classList.remove('has-text');
            }
        });
        
        // Clear search and close popup when X is clicked
        searchClear.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchInput.value = '';
            searchResults.classList.remove('active');
            searchWrapper.classList.remove('has-text');
        });
    }
    
    // Show search results on focus
    if (searchInput && searchResults) {
        searchInput.addEventListener('focus', function() {
            searchResults.classList.add('active');
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(event) {
            // Check if the click is outside both the search input and search results
            if (!searchInput.contains(event.target) && 
                !searchResults.contains(event.target) && 
                !searchClear.contains(event.target)) {
                searchResults.classList.remove('active');
            }
        });
        
        // Prevent clicks inside search results from closing it
        searchResults.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    // Document upload modal
    if (uploadDocumentBtn) {
        uploadDocumentBtn.addEventListener('click', function() {
            uploadDocumentModal.classList.add('active');
        });
    }
    
    if (closeUploadModal) {
        closeUploadModal.addEventListener('click', function() {
            uploadDocumentModal.classList.remove('active');
        });
    }
    
    // Show selected file name
    if (documentFileInput && selectedFileName) {
        documentFileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                selectedFileName.textContent = this.files[0].name;
            } else {
                selectedFileName.textContent = 'No file selected';
            }
        });
    }
    
    // Prevent form submission
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Search submitted:', searchInput.value);
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (notificationModal && event.target === notificationModal) {
            notificationModal.classList.remove('active');
        }
        if (createProjectModal && event.target === createProjectModal) {
            createProjectModal.classList.remove('active');
        }
        if (uploadDocumentModal && event.target === uploadDocumentModal) {
            uploadDocumentModal.classList.remove('active');
        }
    });
    
    // Close sidebar on window resize if it's open
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && sidebar && sidebar.classList.contains('active')) {
            closeSidebarFunc();
        }
    });
    
    // Project form submission
   /* const projectForm = document.querySelector('.project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const projectData = {};
            
            for (const [key, value] of formData.entries()) {
                projectData[key] = value;
            }
            
            console.log('Project data submitted:', projectData);
            
            // Close modal after submission
            if (createProjectModal) {
                createProjectModal.classList.remove('active');
            }
            
            // Reset form
            this.reset();
            
            // Show success message
            alert('Project created successfully!');
        });
    }
        */
       // Project form submission
const projectForm = document.querySelector('.project-form');
if (projectForm) {
    projectForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const projectData = {
            title: formData.get('project-title'),
            description: formData.get('project-description'),
            objectives: formData.get('project-objectives'),
            startDate: formData.get('start-date'),
            endDate: formData.get('end-date'),
            requiredSkills: formData.get('required-skills').split(',').map(skill => skill.trim()),
            maxCollaborators: parseInt(formData.get('max-collaborators')),
            visibility: formData.get('visibility'),
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.currentUser.uid,
            collaborators: [auth.currentUser.uid],
            progress: 0
        };
        
        try {
            // Add project to Firestore
            await db.collection('projects').add(projectData);
            
            // Close modal after submission
            if (createProjectModal) {
                createProjectModal.classList.remove('active');
            }
            
            // Reset form
            this.reset();
            
            // Show success message
            alert('Project created successfully!');
            
            // Refresh the project list if we're on the my-projects page
            if (window.location.pathname.includes('my-projects.html')) {
                loadUserProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project. Please try again.');
        }
    });
}

// Function to load user's projects
async function loadUserProjects() {
    try {
        const projectsSnapshot = await db.collection('projects')
            .where('createdBy', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();
            
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '';
            
            projectsSnapshot.forEach(doc => {
                const project = doc.data();
                const projectId = doc.id;
                
                const projectElement = document.createElement('article');
                projectElement.className = 'research-project';
                projectElement.innerHTML = `
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <section class="project-meta-section">
                        <p class="meta-item">
                            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                            <time datetime="${project.endDate}">Due: ${new Date(project.endDate).toLocaleDateString()}</time>
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            ${project.collaborators.length} Collaborators
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            Last updated: 2 days ago
                        </p>
                    </section>
                    <section class="project-progress">
                        <header class="progress-header">
                            <h3>Progress</h3>
                            <p>${project.progress}%</p>
                        </header>
                        <progress value="${project.progress}" max="100">${project.progress}%</progress>
                    </section>
                    <a href="project-details.html?id=${projectId}" class="project-action-btn">Manage Project</a>
                `;
                
                projectsGrid.appendChild(projectElement);
            });
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Function to search projects
async function searchProjects(query) {
    try {
        // Search by title
        const titleQuery = await db.collection('projects')
            .where('title', '>=', query)
            .where('title', '<=', query + '\uf8ff')
            .limit(5)
            .get();
            
        // Search by skills
        const skillsQuery = await db.collection('projects')
            .where('requiredSkills', 'array-contains', query.toLowerCase())
            .limit(5)
            .get();
            
        // Combine results
        const results = [];
        titleQuery.forEach(doc => results.push({...doc.data(), id: doc.id}));
        skillsQuery.forEach(doc => {
            if (!results.some(r => r.id === doc.id)) {
                results.push({...doc.data(), id: doc.id});
            }
        });
        
        return results;
    } catch (error) {
        console.error('Error searching projects:', error);
        return [];
    }
}

// Update search functionality in script.js
if (searchInput && searchResults) {
    searchInput.addEventListener('input', async function() {
        if (this.value.length > 0) {
            const results = await searchProjects(this.value);
            const resultsContainer = document.querySelector('.search-results-list');
            resultsContainer.innerHTML = '';
            
            if (results.length > 0) {
                results.forEach(project => {
                    const li = document.createElement('li');
                    li.className = 'search-result-item';
                    li.innerHTML = `
                        <i class="fas fa-flask"></i>
                        <p>${project.title}</p>
                        <mark class="result-category">Project</mark>
                    `;
                    
                    li.addEventListener('click', function() {
                        window.location.href = `project-details.html?id=${project.id}`;
                    });
                    
                    resultsContainer.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.className = 'search-result-item no-results';
                li.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No results found for "${this.value}"</p>
                `;
                resultsContainer.appendChild(li);
            }
        } else {
            showRecentSearches();
        }
    });
}

// Load projects when my-projects.html loads
if (window.location.pathname.includes('my-projects.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        auth.onAuthStateChanged(user => {
            if (user) {
                loadUserProjects();
            } else {
                window.location.href = 'index.html';
            }
        });
    });
}

// Handle project details page
if (window.location.pathname.includes('project-details.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (projectId) {
            try {
                const doc = await db.collection('projects').doc(projectId).get();
                if (doc.exists) {
                    const project = doc.data();
                    
                    // Update page title
                    document.querySelector('.project-title-section h1').textContent = project.title;
                    
                    // Update project description
                    document.querySelector('.project-description').textContent = project.description;
                    
                    // Update meta information
                    const metaBar = document.querySelector('.project-meta-bar');
                    metaBar.innerHTML = `
                        <p class="meta-item">
                            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                            <time datetime="${project.endDate}">Due: ${new Date(project.endDate).toLocaleDateString()}</time>
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            ${project.collaborators.length} Collaborators
                        </p>
                        <p class="meta-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            Last updated: 2 days ago
                        </p>
                    `;
                }
            } catch (error) {
                console.error('Error loading project details:', error);
            }
        }
    });
}
    
    // Document upload form submission
    const uploadForm = document.querySelector('.upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const documentData = {};
            
            for (const [key, value] of formData.entries()) {
                if (key !== 'document-file') {
                    documentData[key] = value;
                }
            }
            
            console.log('Document data submitted:', documentData);
            
            // Close modal after submission
            if (uploadDocumentModal) {
                uploadDocumentModal.classList.remove('active');
            }
            
            // Reset form
            this.reset();
            selectedFileName.textContent = 'No file selected';
            
            // Show success message
            alert('Document uploaded successfully!');
        });
    }
    
    // Comment form submission
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const commentText = this.querySelector('#comment-text').value;
            console.log('Comment submitted:', commentText);
            
            // Reset form
            this.reset();
            
            // Show success message
            alert('Comment posted successfully!');
        });
    }
    
    // Handle collaboration request actions
    /*const acceptButtons = document.querySelectorAll('.accept-request');
    const declineButtons = document.querySelectorAll('.decline-request');
    const cancelButtons = document.querySelectorAll('.cancel-request');
    
    if (acceptButtons) {
        acceptButtons.forEach(button => {
            button.addEventListener('click', function() {
                const requestItem = this.closest('.request-item');
                const requestTitle = requestItem.querySelector('h3').textContent;
                alert(`You have accepted the collaboration request: ${requestTitle}`);
                requestItem.style.opacity = '0.5';
                this.disabled = true;
                this.nextElementSibling.disabled = true;
            });
        });
    }
    
    if (declineButtons) {
        declineButtons.forEach(button => {
            button.addEventListener('click', function() {
                const requestItem = this.closest('.request-item');
                const requestTitle = requestItem.querySelector('h3').textContent;
                alert(`You have declined the collaboration request: ${requestTitle}`);
                requestItem.style.opacity = '0.5';
                this.disabled = true;
                this.previousElementSibling.disabled = true;
            });
        });
    }
    
    if (cancelButtons) {
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const requestItem = this.closest('.request-item');
                const requestTitle = requestItem.querySelector('h3').textContent;
                alert(`You have cancelled the collaboration request: ${requestTitle}`);
                requestItem.style.opacity = '0.5';
                this.disabled = true;
            });
        });
    }
    */

    // Handle collaboration requests
async function sendCollaborationRequest(projectId, recipientId) {
    try {
        await db.collection('collaborationRequests').add({
            projectId,
            senderId: auth.currentUser.uid,
            recipientId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Collaboration request sent successfully!');
    } catch (error) {
        console.error('Error sending collaboration request:', error);
        alert('Error sending request. Please try again.');
    }
}

// Handle accepting/rejecting requests
async function respondToRequest(requestId, response) {
    try {
        await db.collection('collaborationRequests').doc(requestId).update({
            status: response,
            respondedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (response === 'accepted') {
            // Add user to project collaborators
            const requestDoc = await db.collection('collaborationRequests').doc(requestId).get();
            const request = requestDoc.data();
            
            await db.collection('projects').doc(request.projectId).update({
                collaborators: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
            });
            
            // Create notification for requester
            await db.collection('notifications').add({
                userId: request.senderId,
                type: 'collaboration',
                message: `${auth.currentUser.displayName} has accepted your request to join the project`,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                link: `/project-details.html?id=${request.projectId}`
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error responding to request:', error);
        return false;
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
            
        const notificationList = document.querySelector('.notification-list');
        if (notificationList) {
            notificationList.innerHTML = '';
            
            notificationsSnapshot.forEach(doc => {
                const notification = doc.data();
                
                const li = document.createElement('li');
                li.className = `notification-item ${notification.read ? '' : 'unread'}`;
                li.innerHTML = `
                    <article class="notification-content">
                        <h3>${notification.type === 'collaboration' ? 'Collaboration Update' : 'Notification'}</h3>
                        <p>${notification.message}</p>
                        <time datetime="${notification.createdAt.toDate().toISOString()}">
                            ${formatTimeAgo(notification.createdAt.toDate())}
                        </time>
                    </article>
                `;
                
                li.addEventListener('click', () => {
                    // Mark as read
                    db.collection('notifications').doc(doc.id).update({ read: true });
                    
                    if (notification.link) {
                        window.location.href = notification.link;
                    }
                });
                
                notificationList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'just now';
}
    
    // Reply to comment functionality
    const replyButtons = document.querySelectorAll('.reply-btn');
    if (replyButtons) {
        replyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentItem = this.closest('.comment-item');
                const commenterName = commentItem.querySelector('.commenter-info h3').textContent;
                const commentForm = document.querySelector('.comment-form textarea');
                commentForm.value = `@${commenterName} `;
                commentForm.focus();
                
                // Scroll to comment form
                commentForm.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    // Set up real-time listener for notifications
function setupNotificationListener() {
    return db.collection('notifications')
        .where('userId', '==', auth.currentUser.uid)
        .where('read', '==', false)
        .onSnapshot(snapshot => {
            const unreadCount = snapshot.size;
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        });
}

// Call this when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        const unsubscribe = setupNotificationListener();
        
        // Clean up listener when user logs out
        window.addEventListener('beforeunload', unsubscribe);
    }
});

    // Sign out functionality
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out?')) {
                // In a real application, this would call an API to invalidate the session
                console.log('User signed out');
                // Redirect to login page
                alert('You have been signed out successfully.');
                window.location.href = '../index.html'; // In the real app, this would go to the landing page
            }
        });
    }
});