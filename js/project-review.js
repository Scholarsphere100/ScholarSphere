// Initialize Firebase (if not already initialized elsewhere)
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
    
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Set up tab navigation - IMPROVED VERSION
    function setupTabs() {
        const tabLinks = document.querySelectorAll('.tabs-nav a');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // First, hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Then activate the first tab by default
        if (tabContents.length > 0) {
            tabContents[0].classList.add('active');
        }
        
        if (tabLinks.length > 0) {
            tabLinks[0].classList.add('active');
        }
        
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all tabs
                tabLinks.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabId = this.getAttribute('data-tab');
                
                // First hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Then show the selected tab content
                const selectedContent = document.getElementById(tabId);
                if (selectedContent) {
                    selectedContent.classList.add('active');
                }
            });
        });
    }
    
    // Get project ID from URL
    const projectId = getUrlParameter('id');
    
    if (!projectId) {
        console.error('No project ID provided in URL');
        document.querySelector('.project-detail-header').innerHTML = `
            <div class="error-message">
                <h2>Error: No project selected</h2>
                <p>Please go back to your projects and select a project to view.</p>
                <a href="my-projects.html" class="action-button">Back to My Projects</a>
            </div>
        `;
        return;
    }
    
    // Check if user is authenticated
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log('User not authenticated. Redirecting to login...');
            // window.location.href = 'login.html';
            return;
        }
        
        try {
            // Fetch project data
            const projectDoc = await db.collection('projects').doc(projectId).get();
            
            if (!projectDoc.exists) {
                console.error('Project not found');
                document.querySelector('.project-detail-header').innerHTML = `
                    <div class="error-message">
                        <h2>Error: Project not found</h2>
                        <p>The project you're looking for doesn't exist or you don't have permission to view it.</p>
                        <a href="my-projects.html" class="action-button">Back to My Projects</a>
                    </div>
                `;
                return;
            }
            
            const projectData = projectDoc.data();
            
            // Check if user has access to this project
            const isOwner = projectData.createdBy === user.uid;
            const isCollaborator = projectData.collaborators && projectData.collaborators.includes(user.uid);
            
            if (!isOwner && !isCollaborator && projectData.visibility !== 'public') {
                console.error('User does not have access to this project');
                document.querySelector('.project-detail-header').innerHTML = `
                    <div class="error-message">
                        <h2>Access Denied</h2>
                        <p>You don't have permission to view this project.</p>
                        <a href="my-projects.html" class="action-button">Back to My Projects</a>
                    </div>
                `;
                return;
            }
            
            // Update page title
            document.title = `${projectData.title || 'Project Details'} - ScholarSphere`;
            
            // Format dates
            const startDate = formatDate(projectData.startDate);
            const endDate = formatDate(projectData.endDate);
            const lastUpdated = getLastUpdatedText(projectData.updatedAt);
            
            // Count collaborators
            const collaboratorsCount = projectData.collaborators ? projectData.collaborators.length : 0;
            
            // Update project header
            const projectHeader = document.querySelector('.project-detail-header');
            projectHeader.innerHTML = `
                <section class="project-title-section">
                    <h1>${projectData.title || 'Untitled Project'}</h1>
                    <mark class="status-badge ${projectData.status || 'active'}">${projectData.status || 'Active'}</mark>
                </section>
                
                <p class="project-description">
                    ${projectData.description || 'No description provided.'}
                </p>
                
                <section class="project-meta-bar">
                    <p class="meta-item">
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                        <time datetime="${projectData.endDate}">Due: ${endDate}</time>
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
            `;
            
            // Update project objectives - Now fetching from the objectives field
            const objectivesContent = document.getElementById('project-objectives-content');
            if (objectivesContent) {
                // Check if objectives field exists in the project data
                if (projectData.objectives) {
                    objectivesContent.innerHTML = projectData.objectives;
                } else {
                    objectivesContent.innerHTML = 'No objectives specified for this project.';
                }
            }
            
            // Update project progress
            const progressPercentage = document.getElementById('progress-percentage');
            const projectProgress = document.getElementById('project-progress');
            if (progressPercentage && projectProgress) {
                const progress = projectData.progress || 0;
                progressPercentage.textContent = `${progress}%`;
                projectProgress.value = progress;
            }
            
            // Set up tabs - IMPORTANT: This must be called after all content is loaded
            setupTabs();
            
            // Fetch and display project documents
            await loadProjectDocuments(db, projectId);
            
            // Fetch and display project collaborators
            await loadProjectCollaborators(db, projectData);
            
            // Initialize document upload functionality
            initDocumentUpload(db, projectId, user.uid);
            
        } catch (error) {
            console.error('Error loading project details:', error);
            document.querySelector('.project-detail-header').innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Project</h2>
                    <p>There was an error loading the project details. Please try again later.</p>
                    <a href="my-projects.html" class="action-button">Back to My Projects</a>
                </div>
            `;
        }
    });
    
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
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                return date.toLocaleDateString('en-US', options);
            }
            
            return 'No date set';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
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
            return formatDate(date);
        }
    }
    
    // Function to load project documents
    async function loadProjectDocuments(db, projectId) {
        try {
            const documentsSnapshot = await db.collection('projects').doc(projectId)
                .collection('documents')
                .orderBy('uploadedAt', 'desc')
                .get();
            
            const documentList = document.querySelector('.document-list');
            
            if (documentList) {
                documentList.innerHTML = '';
                
                if (documentsSnapshot.empty) {
                    documentList.innerHTML = `
                        <li class="no-documents">
                            <p>No documents have been uploaded yet.</p>
                        </li>
                    `;
                    return;
                }
                
                documentsSnapshot.forEach(doc => {
                    const documentData = doc.data();
                    const uploadDate = formatDate(documentData.uploadedAt);
                    
                    // Determine document icon based on type
                    let iconClass = 'fa-file';
                    if (documentData.type === 'pdf') iconClass = 'fa-file-pdf';
                    else if (documentData.type === 'word' || documentData.type === 'doc' || documentData.type === 'docx') iconClass = 'fa-file-word';
                    else if (documentData.type === 'excel' || documentData.type === 'xls' || documentData.type === 'xlsx') iconClass = 'fa-file-excel';
                    else if (documentData.type === 'powerpoint' || documentData.type === 'ppt' || documentData.type === 'pptx') iconClass = 'fa-file-powerpoint';
                    else if (documentData.type === 'image' || documentData.type === 'jpg' || documentData.type === 'png') iconClass = 'fa-file-image';
                    
                    const documentItem = document.createElement('li');
                    documentItem.className = 'document-item';
                    documentItem.innerHTML = `
                        <article class="document-card">
                            <i class="fas ${iconClass} document-icon" aria-hidden="true"></i>
                            <section class="document-info">
                                <h3>${documentData.title || 'Untitled Document'}</h3>
                                <p>${documentData.description || 'No description provided.'}</p>
                                <footer class="document-meta">
                                    <p>Uploaded by: <strong>${documentData.uploaderName || 'Unknown User'}</strong></p>
                                    <time datetime="${documentData.uploadedAt}">${uploadDate}</time>
                                </footer>
                            </section>
                            <section class="document-actions">
                                <button class="document-action-btn" aria-label="Download document" data-document-id="${doc.id}">
                                    <i class="fas fa-download" aria-hidden="true"></i>
                                </button>
                                <button class="document-action-btn" aria-label="Share document" data-document-id="${doc.id}">
                                    <i class="fas fa-share-alt" aria-hidden="true"></i>
                                </button>
                                <button class="document-action-btn delete-document" aria-label="Delete document" data-document-id="${doc.id}">
                                    <i class="fas fa-trash-alt" aria-hidden="true"></i>
                                </button>
                            </section>
                        </article>
                    `;
                    
                    documentList.appendChild(documentItem);
                });
                
                // Add event listeners for document actions
                document.querySelectorAll('.delete-document').forEach(button => {
                    button.addEventListener('click', async function() {
                        const documentId = this.getAttribute('data-document-id');
                        if (confirm('Are you sure you want to delete this document?')) {
                            try {
                                await db.collection('projects').doc(projectId)
                                    .collection('documents').doc(documentId).delete();
                                    
                                // Remove the document item from the DOM
                                this.closest('.document-item').remove();
                                
                                // Show empty message if no documents left
                                if (document.querySelectorAll('.document-item').length === 0) {
                                    documentList.innerHTML = `
                                        <li class="no-documents">
                                            <p>No documents have been uploaded yet.</p>
                                        </li>
                                    `;
                                }
                            } catch (error) {
                                console.error('Error deleting document:', error);
                                alert('Failed to delete document. Please try again.');
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading project documents:', error);
        }
    }
    
    // Function to load project collaborators
    async function loadProjectCollaborators(db, projectData) {
        try {
            const auth = firebase.auth();
            const currentUser = auth.currentUser;
            
            if (!projectData.collaborators || projectData.collaborators.length === 0) {
                const collaboratorsList = document.querySelector('.collaborators-list');
                if (collaboratorsList) {
                    collaboratorsList.innerHTML = '<li>No collaborators for this project.</li>';
                }
                return;
            }
            
            const collaboratorPromises = projectData.collaborators.map(async (userId) => {
                const userDoc = await db.collection('Users').doc(userId).get();
                if (userDoc.exists) {
                    return {
                        id: userId,
                        ...userDoc.data()
                    };
                }
                return null;
            });
            
            const collaborators = (await Promise.all(collaboratorPromises)).filter(Boolean);
            
            // Add the project owner as well
            if (projectData.createdBy) {
                const ownerDoc = await db.collection('Users').doc(projectData.createdBy).get();
                if (ownerDoc.exists) {
                    const ownerData = ownerDoc.data();
                    // Add owner flag to distinguish from collaborators
                    collaborators.push({
                        id: projectData.createdBy,
                        ...ownerData,
                        isOwner: true
                    });
                }
            }
            
            // Update collaborators section
            const collaboratorsList = document.querySelector('.collaborators-list');
            if (collaboratorsList) {
                collaboratorsList.innerHTML = '';
                
                collaborators.forEach(collaborator => {
                    // Determine role text
                    let roleText = 'Collaborator';
                    if (collaborator.isOwner) roleText = 'Project Owner';
                    else if (collaborator.isResearcher) roleText = 'Researcher';
                    else if (collaborator.isReviewer) roleText = 'Reviewer';
                    
                    const collaboratorItem = document.createElement('li');
                    collaboratorItem.className = 'collaborator-item';
                    
                    collaboratorItem.innerHTML = `
                        <img src="" alt="${collaborator.name || 'Collaborator'}" class="collaborator-avatar">
                        <section class="collaborator-info">
                            <h3>${collaborator.name || collaborator.displayName || 'Unknown User'}</h3>
                            <p>${roleText}</p>
                        </section>
                        <section class="collaborator-actions">
                            <button class="collaborator-action-btn" aria-label="Message collaborator" data-user-id="${collaborator.id}">
                                <i class="fas fa-comment" aria-hidden="true"></i>
                            </button>
                        </section>
                    `;
                    
                    collaboratorsList.appendChild(collaboratorItem);
                });
                
                // Add event listeners for collaborator actions
                document.querySelectorAll('.collaborator-action-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-user-id');
                        // Redirect to messaging page with this user
                        window.location.href = `messaging.html?user=${userId}`;
                    });
                });
                
                // Add event listeners for remove collaborator buttons
                document.querySelectorAll('.remove-collaborator').forEach(button => {
                    button.addEventListener('click', async function() {
                        const userId = this.getAttribute('data-user-id');
                        if (confirm(`Are you sure you want to remove this collaborator from the project?`)) {
                            await removeCollaborator(db, projectData.id, userId);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading project collaborators:', error);
        }
    }
    
    // Function to initialize document upload
    function initDocumentUpload(db, projectId, userId) {
        const uploadBtn = document.getElementById('upload-document-btn');
        const uploadModal = document.getElementById('upload-document-modal');
        const closeUploadModal = document.getElementById('close-upload-modal');
        const uploadForm = document.querySelector('.upload-form');
        const fileInput = document.getElementById('document-file');
        const fileNameDisplay = document.getElementById('selected-file-name');
        
        if (uploadBtn && uploadModal && closeUploadModal) {
            // Show upload modal
            uploadBtn.addEventListener('click', () => {
                uploadModal.style.display = 'flex';
            });
            
            // Hide upload modal
            closeUploadModal.addEventListener('click', () => {
                uploadModal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === uploadModal) {
                    uploadModal.style.display = 'none';
                }
            });
        }
        
        // Display selected file name
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    fileNameDisplay.textContent = fileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = 'No file selected';
                }
            });
        }
        
        // Handle form submission
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('document-title').value;
                const description = document.getElementById('document-description').value;
                const type = document.getElementById('document-type').value;
                const visibility = document.getElementById('document-visibility').value;
                
                if (!fileInput.files.length) {
                    alert('Please select a file to upload');
                    return;
                }
                
                try {
                    // In a real app, you would upload the file to storage here
                    // For now, we'll just add a document reference to Firestore
                    
                    // Get user name
                    const userDoc = await db.collection('Users').doc(userId).get();
                    const userName = userDoc.exists ? (userDoc.data().name || 'Unknown User') : 'Unknown User';
                    
                    // Add document to Firestore
                    await db.collection('projects').doc(projectId)
                        .collection('documents').add({
                            title,
                            description,
                            type,
                            visibility,
                            uploaderId: userId,
                            uploaderName: userName,
                            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            fileName: fileInput.files[0].name,
                            fileSize: fileInput.files[0].size,
                            fileType: fileInput.files[0].type
                        });
                    
                    // Update project's lastUpdated timestamp
                    await db.collection('projects').doc(projectId).update({
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Reload documents
                    await loadProjectDocuments(db, projectId);
                    
                    // Reset form and close modal
                    uploadForm.reset();
                    fileNameDisplay.textContent = 'No file selected';
                    uploadModal.style.display = 'none';
                    
                    alert('Document uploaded successfully!');
                } catch (error) {
                    console.error('Error uploading document:', error);
                    alert('Failed to upload document. Please try again.');
                }
            });
        }
    }
});