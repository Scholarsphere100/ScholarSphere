const firebaseConfig = {
    apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
    authDomain: "scholarsphere-a8c83.firebaseapp.com",
    projectId: "scholarsphere-a8c83",
    storageBucket: "scholarsphere-a8c83.firebasestorage.app",
    messagingSenderId: "841487458923",
    appId: "1:841487458923:web:b171e7057ae763fcb1472e",
    measurementId: "G-NNYQ7E1KY2"
};

const ScholarSphere = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


export { auth, db};

// Function to add a new research project item using DOM manipulation
export function addNewResearchItem(Title, Description, Skills, date, projectID) {
    // Get the unordered list element
    const searchResultList = document.querySelector('.search-result');
    if (!searchResultList) {
        //alert('Search results container not found');
        return;
    }
    
    // Create a new list item
    const newListItem = document.createElement('li');
    newListItem.className = 'search-item';
    
    // Create the article element
    const article = document.createElement('article');
    article.className = 'search-card';
    
    // Create and append the header
    const header = document.createElement('header');
    header.className = 'project-header';
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = Title;
    header.appendChild(headerTitle);
    article.appendChild(header);
    
    // Create and append the description
    const description = document.createElement('p');
    description.className = 'project-search-description';
    description.textContent = Description;
    article.appendChild(description);
    
    // Create and append the skills section
    const skills = document.createElement('p');
    skills.className = 'project-skills';
    const skillsText = document.createTextNode('Skills needed: ');
    const skillsStrong = document.createElement('strong');
    skillsStrong.textContent = 'Skills needed:';
    skills.appendChild(skillsStrong);
    skills.appendChild(document.createTextNode(Skills));
    article.appendChild(skills);
    
    // Create and append the meta section with date
    const meta = document.createElement('p');
    meta.className = 'project-meta';
    
    const calendarIcon = document.createElement('i');
    calendarIcon.className = 'fas fa-calendar-alt';
    calendarIcon.setAttribute('aria-hidden', 'true');
    meta.appendChild(calendarIcon);
    
    meta.appendChild(document.createTextNode(' '));
    
    const timeElement = document.createElement('time');
    const currentDate = new Date();
    timeElement.setAttribute('datetime', currentDate.toISOString().split('T')[0]);
    timeElement.textContent = `Created: ` + date;
    meta.appendChild(timeElement);
    
    article.appendChild(meta);
    
    // Create and append the footer with button
    const footer = document.createElement('footer');
    footer.className = 'request-actions';
    const button = document.createElement('button');
    button.className = 'send-request-btn';
    button.textContent = 'Send Request';
    button.id = projectID;
    footer.appendChild(button);
    article.appendChild(footer);
    
    // Append the article to the list item
    newListItem.appendChild(article);
    
    // Append the new item to the list
    searchResultList.appendChild(newListItem);
}

// Function to clear all research items from the display
export function clearResearchItems() {
    const searchResultList = document.querySelector('.search-result');
    if (searchResultList) {
        searchResultList.innerHTML = '';
    }
}

// Function to search projects
const searchProjects = async () => {
    try {
        // Get search input value and convert to lowercase 
        const searchInput = document.getElementById('search-input');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }
        
        const searchTerm = searchInput.value.trim().toLowerCase();
        clearResearchItems();

        // If empty search term, show all projects
        if (!searchTerm) {
            getAllProjects();
            return;
        }

        const projectsCollection = await db.collection("projects").get();

        if (projectsCollection.empty) {
            console.log("No projects found in the database.");
            const searchResultList = document.querySelector('.search-result');
            if (searchResultList) {
                const noResults = document.createElement('p');
                noResults.textContent = 'No projects available.';
                noResults.className = 'no-results';
                searchResultList.appendChild(noResults);
            }
            return;
        }

        let foundMatches = false;

        projectsCollection.forEach((doc) => {
            const data = doc.data();
            const title = data.title || '';
            const description = data.description || '';
            const requiredSkills = data.requiredSkills || [];
            
            // Check if search term exists in title, description, or skills
            const titleMatch = title.toLowerCase().includes(searchTerm);
            const descriptionMatch = description.toLowerCase().includes(searchTerm);
            const skillsMatch = requiredSkills.some(skill => 
                skill.toLowerCase().includes(searchTerm)
            );

            if (titleMatch || descriptionMatch || skillsMatch) {
                foundMatches = true;
                const skillsString = requiredSkills.join(', ');
                const date = data.startDate || new Date().toLocaleDateString();
                
                addNewResearchItem(title, description, skillsString, date, doc.id);
            }
        });

        if (!foundMatches) {
            // Show message when no matches found
            const searchResultList = document.querySelector('.search-result');
            if (searchResultList) {
                const noResults = document.createElement('p');
                noResults.textContent = 'No projects found matching your search.';
                noResults.className = 'no-results';
                searchResultList.appendChild(noResults);
            }
        }

    } catch (error) {
        console.error("Error searching projects:", error);
    }
};

const getAllProjects = async () => {
    try {
        const projectsCollection = await db.collection("projects").get();

        if (projectsCollection.empty) {
            const searchResultList = document.querySelector('.search-result');
            if (searchResultList) {
                const noProjects = document.createElement('p');
                noProjects.textContent = 'No projects available.';
                noProjects.className = 'no-results';
                searchResultList.appendChild(noProjects);
            }
            return;
        }

        projectsCollection.forEach((doc) => {
            const data = doc.data();
            const title = data.title || '';
            const description = data.description || '';
            const array = data.requiredSkills || [];
            const skills = array.join(', ');
            const date = data.startDate || new Date().toLocaleDateString();
            
            addNewResearchItem(title, description, skills, date, doc.id);
        });
    } catch (error) {
        console.error("Error getting projects:", error);
    }
};

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Search button event listener
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            searchProjects();
        });
    }

    // Initialize the app by loading all projects
    getAllProjects();

    // Event delegation for send request buttons
    const searchResults = document.querySelector('.search-result');
    if (searchResults) {
        searchResults.addEventListener('click', function(e) {
            if (e.target.classList.contains('send-request-btn')) {
                const projectId = e.target.id;
                if (projectId) {
                    sendCollaborationRequest(projectId);
                }
            }
        });
    }
});

// Send collaboration request (unchanged)
async function sendCollaborationRequest(projectId) {
    try {
        const projectRef = db.collection('projects').doc(projectId);
        const projectDoc = await projectRef.get();
        
        if (!projectDoc.exists) {
            alert('Project not found!');
            return;
        }
        
        const project = projectDoc.data();
        const projectOwner = project.createdBy;
        
        if (projectOwner === auth.currentUser.uid) {
            alert('You cannot send a request to your own project!');
            return;
        }
        
        // Check if request already exists
        const existingRequest = await db.collection('collaborationRequests')
            .where('projectId', '==', projectId)
            .where('senderId', '==', auth.currentUser.uid)
            .where('recipientId', '==', projectOwner)
            .get();
            
        if (!existingRequest.empty) {
            alert('You have already sent a request for this project!');
            return;
        }
        
        // Create new request
        await db.collection('collaborationRequests').add({
            projectId,
            projectTitle: project.title,
            senderId: auth.currentUser.uid,
            senderName: auth.currentUser.displayName || 'Anonymous',
            recipientId: projectOwner,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Create notification for project owner
        await db.collection('notifications').add({
            userId: projectOwner,
            type: 'collaboration',
            message: `${auth.currentUser.displayName || 'A researcher'} has requested to join your project "${project.title}"`,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            link: `project-details.html?id=${projectId}`
        });
        
        alert('Collaboration request sent successfully!');
    } catch (error) {
        console.error('Error sending collaboration request:', error);
        alert('Error sending request. Please try again.');
    }
}

// Wait for auth to initialize and check user status
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('Users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                const navContainer = document.querySelector('.sidebar-nav ul');
                
                if (navContainer) {
                    // Clear existing navigation
                    navContainer.innerHTML = '';
                    
                    if (userData.isResearcher) {
                        // Researcher navigation
                        navContainer.innerHTML = `
                        <li><a href="../html/researcher-dashboard.html"><i class="fas fa-home" aria-hidden="true"></i> Dashboard</a></li>
                        <li><a href="../html/my-projects.html"><i class="fas fa-flask" aria-hidden="true"></i> My Research</a></li>
                        <li><a href="../html/collaborations.html"><i class="fas fa-users" aria-hidden="true"></i> Collaborations</a></li>
                        <li><a href="../html/search.html" class="active"><i class="fas fa-search" aria-hidden="true"></i> Find Projects</a></li>
                        <li><a href="../html/chat.html"><i class="fas fa-comments" aria-hidden="true"></i> Messages</a></li>
                        <li><a href="../html/funding.html"><i class="fas fa-sack-dollar" aria-hidden="true"></i> Funding</a></li>
                        <li><a href="../html/milestones.html"><i class="fas fa-trophy" aria-hidden="true"></i> Milestones</a></li>                        
                        `;
                    } 
                    else if (userData.isReviewer) {
                        // Reviewer navigation
                        navContainer.innerHTML = `
                            <li><a href="../html/reviewer-dashboard.html" class="active"><i class="fas fa-home" aria-hidden="true"></i> Dashboard</a></li>
                            <li><a href="../html/assigned-projects.html"><i class="fas fa-clipboard-check" aria-hidden="true"></i> Assigned Projects</a></li>
                            <li><a href="../html/collaborations.html"><i class="fas fa-users" aria-hidden="true"></i> Collaborations</a></li>
                            <li><a href="../html/search.html"><i class="fas fa-history" aria-hidden="true"></i> Search</a></li>
                            <li><a href="../html/chat.html" ><i class="fas fa-comments" aria-hidden="true"></i> Messages</a></li>
                            <li><a href="../html/milestones.html"><i class="fas fa-trophy" aria-hidden="true"></i> Milestones</a></li>  
                        `;
                    }
                    
                  
                    highlightActiveLink();
                }
            }
        } catch (error) {
            console.error("Error loading navigation:", error);
        }
    }
});

// Helper function to highlight current page
function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}