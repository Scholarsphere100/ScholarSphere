import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    getDocs,
    getDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuBIw5tkpyEYxqJX1d7xziNaKHRoW4E9M",
    authDomain: "scholarsphere-a8c83.firebaseapp.com",
    databaseURL: "https://scholarsphere-a8c83-default-rtdb.firebaseio.com",
    projectId: "scholarsphere-a8c83",
    storageBucket: "scholarsphere-a8c83.appspot.com",
    messagingSenderId: "841487458923",
    appId: "1:841487458923:web:b171e7057ae763fcb1472e",
    measurementId: "G-NNYQ7E1KY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const milestonesCollection = collection(db, "milestones");
const projectsCollection = collection(db, "projects");

// DOM Elements
let currentMilestoneId = null;
let currentProjectId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addMilestoneBtn = document.getElementById('add-milestone-btn');
    const milestoneModal = document.getElementById('add-milestone-modal');
    const closeMilestoneModal = document.getElementById('close-milestone-modal');
    const detailsModal = document.getElementById('milestone-details-modal');
    const closeDetailsModal = document.getElementById('close-details-modal');
    const updateModal = document.getElementById('update-progress-modal');
    const closeUpdateModal = document.getElementById('close-update-modal');
    const progressRange = document.getElementById('progress-percentage');
    const rangeValue = document.querySelector('.range-value');
    const milestoneForm = document.querySelector('.milestone-form');
    const updateForm = document.querySelector('.update-progress-form');
    const milestoneFile = document.getElementById('milestone-file');
    const selectedMilestoneFiles = document.getElementById('selected-milestone-files');
    const updateFile = document.getElementById('update-file');
    const selectedUpdateFiles = document.getElementById('selected-update-files');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const closeSidebar = document.getElementById('close-sidebar');

    // Load projects when modal opens
    if (addMilestoneBtn && milestoneModal) {
        addMilestoneBtn.addEventListener('click', async () => {
            await loadProjects();
            milestoneModal.classList.add('active');
        });
    }

    // Modal functionality
    if (closeMilestoneModal) {
        closeMilestoneModal.addEventListener('click', () => milestoneModal.classList.remove('active'));
    }

    // Progress range input
    if (progressRange && rangeValue) {
        progressRange.addEventListener('input', function() {
            rangeValue.textContent = this.value + '%';
        });
    }

    // File input displays
    if (milestoneFile && selectedMilestoneFiles) {
        milestoneFile.addEventListener('change', function() {
            updateFileDisplay(this.files, selectedMilestoneFiles);
        });
    }

    if (updateFile && selectedUpdateFiles) {
        updateFile.addEventListener('change', function() {
            updateFileDisplay(this.files, selectedUpdateFiles);
        });
    }

    // Sidebar toggle
    if (menuToggle && sidebar && sidebarOverlay && closeSidebar) {
        menuToggle.addEventListener('click', () => toggleSidebar(true));
        closeSidebar.addEventListener('click', () => toggleSidebar(false));
        sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });

    // Form submissions
    if (milestoneForm) {
        milestoneForm.addEventListener('submit', handleMilestoneSubmit);
    }

    if (updateForm) {
        updateForm.addEventListener('submit', handleProgressUpdate);
    }

    // View Details modal close
    if (closeDetailsModal) {
        closeDetailsModal.addEventListener('click', () => {
            detailsModal.classList.remove('active');
        });
    }

    // Update Progress modal close
    if (closeUpdateModal) {
        closeUpdateModal.addEventListener('click', () => {
            updateModal.classList.remove('active');
        });
    }

    // Setup view and update buttons for existing milestones
    setupMilestoneInteractions();

    // Load and display milestones
    loadMilestones();
});

async function loadProjects() {
    const projectSelect = document.getElementById('milestone-project');
    if (!projectSelect) return;

    try {
        // Clear existing options except the first one
        while (projectSelect.options.length > 1) {
            projectSelect.remove(1);
        }

        // Get all projects from Firestore
        const querySnapshot = await getDocs(projectsCollection);
        
        querySnapshot.forEach((doc) => {
            const project = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = project.title;
            projectSelect.appendChild(option);
        });

        // If we're adding a milestone to a specific project (from project details page)
        if (currentProjectId) {
            projectSelect.value = currentProjectId;
        }
    } catch (error) {
        console.error("Error loading projects: ", error);
    }
}

function toggleSidebar(show) {
    if (show) {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    } else {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
}

function updateFileDisplay(files, displayElement) {
    if (files.length > 0) {
        displayElement.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`;
    } else {
        displayElement.textContent = 'No files selected';
    }
}

async function handleMilestoneSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const projectId = form['milestone-project'].value;
    
    if (!projectId) {
        alert("Please select a project for this milestone");
        return;
    }

    // Get project details to include in milestone
    let projectTitle = "";
    try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
            projectTitle = projectDoc.data().title;
        }
    } catch (error) {
        console.error("Error fetching project: ", error);
    }

    const newMilestone = {
        title: form['milestone-title'].value,
        description: form['milestone-description'].value,
        dueDate: form['milestone-due-date'].value,
        priority: form['milestone-priority'].value,
        assignees: Array.from(form['milestone-assignees'].selectedOptions).map(option => option.value),
        status: 'upcoming',
        progress: 0,
        createdAt: new Date().toISOString(),
        projectId: projectId,
        projectTitle: projectTitle,
        attachments: []
    };

    try {
        // Upload files if any
        if (form['milestone-file'].files.length > 0) {
            const uploadPromises = Array.from(form['milestone-file'].files).map(file => {
                const fileRef = storageRef(storage, `milestones/${Date.now()}_${file.name}`);
                return uploadBytes(fileRef, file)
                    .then(snapshot => getDownloadURL(snapshot.ref))
                    .then(url => ({ 
                        name: file.name, 
                        url,
                        type: file.type.split('/')[0] || 'file' 
                    }));
            });
            
            newMilestone.attachments = await Promise.all(uploadPromises);
        }

        // Add to Firestore
        const docRef = await addDoc(milestonesCollection, newMilestone);
        alert("Milestone added with ID: ", docRef.id);

        // Update project's milestones count
        await updateProjectMilestonesCount(projectId);

        // Reset form
        form.reset();
        milestoneModal.classList.remove('active');
        selectedMilestoneFiles.textContent = 'No files selected';
    } catch (error) {
        console.error("Error adding milestone: ", error);
        alert("Error adding milestone. Please try again.");
    }
}

async function updateProjectMilestonesCount(projectId) {
    try {
        // Count milestones for this project
        const q = query(milestonesCollection, where("projectId", "==", projectId));
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size;

        // Update project document
        await updateDoc(doc(db, "projects", projectId), {
            milestonesCount: count,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating project milestones count: ", error);
    }
}

async function handleProgressUpdate(e) {
    e.preventDefault();
    const form = e.target;
    
    const updates = {
        progress: parseInt(form['progress-percentage'].value),
        status: form['progress-percentage'].value === '100' ? 'completed' : 'in-progress',
        updatedAt: new Date().toISOString(),
        notes: form['update-notes'].value
    };

    // Add mark as complete if checked
    if (form['mark-complete'].checked) {
        updates.progress = 100;
        updates.status = 'completed';
        updates.completionDate = new Date().toISOString();
    }

    try {
        // Upload file if any
        if (form['update-file'].files.length > 0) {
            const fileRef = storageRef(storage, `milestone-updates/${Date.now()}_${form['update-file'].files[0].name}`);
            const snapshot = await uploadBytes(fileRef, form['update-file'].files[0]);
            updates.attachment = {
                name: form['update-file'].files[0].name,
                url: await getDownloadURL(snapshot.ref),
                type: form['update-file'].files[0].type.split('/')[0] || 'file'
            };
        }

        // Update in Firestore
        await updateDoc(doc(db, "milestones", currentMilestoneId), updates);
        
        // Reset form
        form.reset();
        updateModal.classList.remove('active');
        selectedUpdateFiles.textContent = 'No files selected';
        rangeValue.textContent = '0%';
    } catch (error) {
        console.error("Error updating milestone: ", error);
        alert("Error updating milestone. Please try again.");
    }
}

function loadMilestones() {
    const milestonesList = document.querySelector('.milestones-list');
    if (!milestonesList) return;

    // Check if we're viewing milestones for a specific project
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('projectId');

    let q;
    if (currentProjectId) {
        // Query milestones for this specific project
        q = query(
            milestonesCollection, 
            where("projectId", "==", currentProjectId),
            orderBy('dueDate', 'asc')
        );
        
        // Update the project title in the header if we're on a project-specific page
        updateProjectHeader(currentProjectId);
    } else {
        // Query all milestones ordered by due date
        q = query(milestonesCollection, orderBy('dueDate', 'asc'));
    }

    onSnapshot(q, (querySnapshot) => {
        milestonesList.innerHTML = ''; // Clear existing milestones

        querySnapshot.forEach((doc) => {
            const milestone = doc.data();
            const milestoneId = doc.id;
            
            const milestoneItem = document.createElement('li');
            milestoneItem.className = `milestone-item ${milestone.status || 'upcoming'}`;
            milestoneItem.innerHTML = `
                <article class="milestone-card">
                    <header class="milestone-header">
                        <h3>${milestone.title}</h3>
                        <mark class="milestone-status">${formatStatus(milestone.status)}</mark>
                    </header>
                    <section class="milestone-details">
                        <p>${milestone.description}</p>
                        <dl class="milestone-meta">
                            ${!currentProjectId ? `
                            <dt><strong>Project:</strong></dt>
                            <dd>${milestone.projectTitle || 'No project'}</dd>
                            ` : ''}
                            <dt><strong>Assigned to:</strong></dt>
                            <dd>${milestone.assignees ? milestone.assignees.join(', ') : 'Not assigned'}</dd>
                            <dt><strong>Due Date:</strong></dt>
                            <dd><time datetime="${milestone.dueDate}">${new Date(milestone.dueDate).toLocaleDateString()}</time></dd>
                            ${milestone.completionDate ? `
                            <dt><strong>Completion Date:</strong></dt>
                            <dd><time datetime="${milestone.completionDate}">${new Date(milestone.completionDate).toLocaleDateString()}</time></dd>
                            ` : ''}
                        </dl>
                        <figure class="milestone-progress-bar">
                            <progress value="${milestone.progress || 0}" max="100"></progress>
                            <figcaption class="progress-text">${milestone.progress || 0}% Complete</figcaption>
                        </figure>
                    </section>
                    <footer class="milestone-footer">
                        <p class="milestone-attachments">
                            <i class="fas fa-paperclip" aria-hidden="true"></i>
                            ${milestone.attachments ? milestone.attachments.length : 0} attachments
                        </p>
                        <menu class="milestone-actions">
                            <li>
                                <button class="action-btn view-btn" data-id="${milestoneId}">
                                    <i class="fas fa-eye" aria-hidden="true"></i>
                                    View Details
                                </button>
                            </li>
                            <li>
                                <button class="action-btn update-btn" data-id="${milestoneId}">
                                    <i class="fas fa-edit" aria-hidden="true"></i>
                                    Update Progress
                                </button>
                            </li>
                        </menu>
                    </footer>
                </article>
            `;
            milestonesList.appendChild(milestoneItem);
        });

        // Update progress stats
        updateProgressStats(querySnapshot.docs.map(doc => doc.data()));
        
        // Re-setup event listeners for the new elements
        setupMilestoneInteractions();
    });
}

async function updateProjectHeader(projectId) {
    try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
            const project = projectDoc.data();
            const sectionHeader = document.querySelector('.section-header h2');
            if (sectionHeader) {
                sectionHeader.textContent = project.title;
            }
        }
    } catch (error) {
        console.error("Error fetching project: ", error);
    }
}

function updateProgressStats(milestones) {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const upcoming = milestones.filter(m => !m.status || m.status === 'upcoming').length;
    
    const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
    const avgProgress = milestones.length > 0 ? Math.round(totalProgress / milestones.length) : 0;
    
    // Update progress circle
    const circle = document.querySelector('.circle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${avgProgress}, 100`);
    }
    
    const percentageText = document.querySelector('.percentage');
    if (percentageText) {
        percentageText.textContent = `${avgProgress}%`;
    }
    
    // Update stats list
    const statsList = document.querySelector('.progress-stats');
    if (statsList) {
        statsList.innerHTML = `
            <li><i class="fas fa-check-circle" aria-hidden="true"></i> <strong>${completed}</strong> milestones completed</li>
            <li><i class="fas fa-spinner" aria-hidden="true"></i> <strong>${inProgress}</strong> milestones in progress</li>
            <li><i class="fas fa-clock" aria-hidden="true"></i> <strong>${upcoming}</strong> milestones upcoming</li>
        `;
        
        // Find next due milestone
        const nextMilestone = milestones.find(m => !m.completionDate && new Date(m.dueDate) > new Date());
        if (nextMilestone) {
            statsList.innerHTML += `
                <li><i class="fas fa-calendar-alt" aria-hidden="true"></i> Next milestone due: <strong>${new Date(nextMilestone.dueDate).toLocaleDateString()}</strong></li>
            `;
        }
    }
}

function setupMilestoneInteractions() {
    // View Details buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentMilestoneId = this.dataset.id;
            showMilestoneDetails(currentMilestoneId);
        });
    });

    // Update Progress buttons
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentMilestoneId = this.dataset.id;
            const updateModal = document.getElementById('update-progress-modal');
            if (updateModal) {
                updateModal.classList.add('active');
            }
        });
    });
}

async function showMilestoneDetails(milestoneId) {
    try {
        const milestoneDoc = await getDoc(doc(db, "milestones", milestoneId));
        if (milestoneDoc.exists()) {
            const milestone = milestoneDoc.data();
            const modal = document.getElementById('milestone-details-modal');
            
            // Update modal content
            modal.querySelector('.milestone-detail-header h3').textContent = milestone.title;
            modal.querySelector('.milestone-status').textContent = formatStatus(milestone.status);
            
            // Description
            modal.querySelector('.milestone-detail-section h4').textContent = 'Description';
            modal.querySelector('.milestone-detail-section p').textContent = milestone.description;
            
            // Timeline
            const timelineSection = modal.querySelectorAll('.milestone-detail-section')[1];
            timelineSection.innerHTML = `
                <h4>Timeline</h4>
                <ul class="detail-list">
                    <li><strong>Project:</strong> ${milestone.projectTitle || 'No project'}</li>
                    <li><strong>Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString()}</li>
                    ${milestone.completionDate ? `
                    <li><strong>Completion Date:</strong> ${new Date(milestone.completionDate).toLocaleDateString()}</li>
                    ` : ''}
                    <li><strong>Created On:</strong> ${new Date(milestone.createdAt).toLocaleDateString()}</li>
                </ul>
            `;
            
            // Assigned Team Members
            const teamSection = modal.querySelectorAll('.milestone-detail-section')[2];
            teamSection.innerHTML = `
                <h4>Assigned Team Members</h4>
                <ul class="team-members-list">
                    ${milestone.assignees ? milestone.assignees.map(assignee => `
                        <li>
                            <img src="https://via.placeholder.com/32" alt="${assignee}" class="member-avatar">
                            <span>${assignee}</span>
                        </li>
                    `).join('') : '<li>No team members assigned</li>'}
                </ul>
            `;
            
            // Attachments
            const attachmentsSection = modal.querySelectorAll('.milestone-detail-section')[4];
            attachmentsSection.innerHTML = `
                <h4>Attachments</h4>
                <ul class="attachments-list">
                    ${milestone.attachments && milestone.attachments.length > 0 ? 
                        milestone.attachments.map(file => `
                            <li class="attachment-item">
                                <i class="fas fa-file-${file.type === 'image' ? 'image' : file.type === 'application' ? 'pdf' : 'alt'}" aria-hidden="true"></i>
                                <span>${file.name}</span>
                                <button class="download-btn">
                                    <i class="fas fa-download" aria-hidden="true"></i>
                                </button>
                            </li>
                        `).join('') : 
                        '<li>No attachments</li>'}
                </ul>
            `;
            
            // Show modal
            modal.classList.add('active');
        }
    } catch (error) {
        console.error("Error fetching milestone details: ", error);
        alert("Error loading milestone details. Please try again.");
    }
}

function formatStatus(status) {
    const statusMap = {
        'completed': 'Completed',
        'in-progress': 'In Progress',
        'upcoming': 'Upcoming',
        'not-started': 'Not Started'
    };
    return statusMap[status] || status;
}