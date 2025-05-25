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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Rest of your existing code...
const incomingList = document.querySelector('.request-list');
const outgoingList = document.querySelector('.request-list.outgoing');
const activeList = document.querySelector('.request-list.active');

// Load collaboration requests
export async function loadRequests(userId) {
    try {
        const snapshot = await db.collection('collaborationRequests')
            .orderBy('createdAt', 'desc')
            .get();

        incomingList.innerHTML = '';
        outgoingList.innerHTML = '';
        activeList.innerHTML = '';

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const requestId = doc.id;

            // Skip if no projectId exists
            if (!data.projectId) continue;

            try {
                const projectSnap = await db.collection('projects').doc(data.projectId).get();
                if (!projectSnap.exists) continue;

                const projectTitle = projectSnap.data().title || 'Unknown Project';
                const date = data.createdAt ? data.createdAt.toDate() : new Date();

                const card = document.createElement('li');
                card.classList.add('request-item');

                if (data.recipientId === userId) {
                    // Incoming request
                    card.classList.add('incoming');
                    card.innerHTML = renderCardHTML(
                        projectTitle,
                        data.senderName || 'Unknown Researcher',
                        data.message || '',
                        data.status || 'pending',
                        date,
                        true
                    );
                    attachRespondHandlers(card, requestId);
                    incomingList.appendChild(card);
                } else if (data.senderId === userId) {
                    // Outgoing request
                    card.classList.add('outgoing');
                    card.innerHTML = renderCardHTML(
                        projectTitle,
                        'You',
                        data.message || '',
                        data.status || 'pending',
                        date,
                        false
                    );
                    outgoingList.appendChild(card);
                }

                // Active collaborations
                if (data.status === 'accepted' && (data.senderId === userId || data.recipientId === userId)) {
                    const activeCard = document.createElement('li');
                    activeCard.classList.add('request-item');
                    activeCard.innerHTML = renderCardHTML(
                        projectTitle,
                        data.senderId === userId ? 'You (Owner)' : 'Collaborator',
                        '',
                        'accepted',
                        date,
                        false
                    );
                    activeList.appendChild(activeCard);
                }
            } catch (error) {
                console.error('Error processing request:', error);
            }
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        alert('Failed to load collaboration requests. Please try again.');
    }
}

export function renderCardHTML(projectTitle, requester, message, status, date, allowActions) {
    return `
        <article class="request-card">
            <header class="request-header">
                <h3>${projectTitle}</h3>
                <mark class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</mark>
            </header>
            <p class="request-description">Request from ${requester}</p>
            ${message ? `<p class="request-message">"${message}"</p>` : ''}
            <p class="request-meta">
                <i class="fas fa-calendar-alt" aria-hidden="true"></i> 
                <time datetime="${date.toISOString()}">${date.toLocaleDateString()}</time>
            </p>
            ${allowActions ? `
            <footer class="request-actions">
                <button class="accept-request">Accept</button>
                <button class="decline-request">Decline</button>
            </footer>` : ''}
        </article>
    `;
}

export function attachRespondHandlers(card, requestId) {
    const acceptBtn = card.querySelector('.accept-request');
    const declineBtn = card.querySelector('.decline-request');

    acceptBtn?.addEventListener('click', async () => {
        const success = await respondToRequest(requestId, 'accepted');
        if (success) card.remove();
    });

    declineBtn?.addEventListener('click', async () => {
        const success = await respondToRequest(requestId, 'rejected');
        if (success) card.remove();
    });
}

export async function respondToRequest(requestId, response) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to respond to requests.');
            return false;
        }

        // Update the request with client-side timestamp
        await db.collection('collaborationRequests').doc(requestId).update({
            status: response,
            respondedAt: firebase.firestore.Timestamp.now()
        });

        const requestDoc = await db.collection('collaborationRequests').doc(requestId).get();
        const request = requestDoc.data();

        if (response === 'accepted' && request.projectId) {
            await db.collection('projects').doc(request.projectId).update({
                collaborators: firebase.firestore.FieldValue.arrayUnion(user.uid)
            });

            const projectRef = db.collection('projects').doc(request.projectId);
             // Add the sender as a collaborator
        await projectRef.update({
            collaborators: firebase.firestore.FieldValue.arrayUnion(request.senderId)
            });

            await db.collection('notifications').add({
                userId: request.senderId,
                type: 'collaboration',
                message: `${user.displayName || 'A researcher'} has accepted your collaboration request.`,
                read: false,
                createdAt: firebase.firestore.Timestamp.now(),
                link: `/project-details.html?id=${request.projectId}`
            });
        }

        alert(`Request ${response}`);
        return true;
    } catch (error) {
        console.error('Error handling response:', error);
        alert('An error occurred while processing your response.');
        return false;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Menu toggle functionality
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

 
    
    // Auth state observer
    auth.onAuthStateChanged(user => {
        if (user) {
            loadRequests(user.uid);
        } else {
            console.log('User not authenticated');
            // You might want to redirect to login page here
        }
    });

    //Hope moved loadRequests outside scope

    // Render request card HTML
    //moved outside scope

    // Attach event handlers to response buttons
    //moved outside scope 
    
    // Handle request response - FIXED VERSION
    //moved outside scope 
});

// Export all functions for testing
if (typeof exports !== 'undefined') {
    // User management (placeholder exports for this file)
    exports.loadRequests = loadRequests;
    exports.renderCardHTML = renderCardHTML;
    exports.attachRespondHandlers = attachRespondHandlers;
    exports.respondToRequest = respondToRequest;
  
    // Placeholders for future or external user/project functions
    exports.addPendingResearcher = typeof addPendingResearcher !== 'undefined' ? addPendingResearcher : () => {};
    exports.addPendingReviewer = typeof addPendingReviewer !== 'undefined' ? addPendingReviewer : () => {};
    exports.getAllUsers = typeof getAllUsers !== 'undefined' ? getAllUsers : () => {};
    exports.updateUsers = typeof updateUsers !== 'undefined' ? updateUsers : () => {};
    exports.approve = typeof approve !== 'undefined' ? approve : () => {};
    exports.reject = typeof reject !== 'undefined' ? reject : () => {};
    exports.updateProgress = typeof updateProgress !== 'undefined' ? updateProgress : () => {};
  
    // Project Reports
    exports.generateProjectCompletionReport = typeof generateProjectCompletionReport !== 'undefined' ? generateProjectCompletionReport : () => {};
    exports.groupMilestonesByProject = typeof groupMilestonesByProject !== 'undefined' ? groupMilestonesByProject : () => {};
    exports.calculateProjectMetrics = typeof calculateProjectMetrics !== 'undefined' ? calculateProjectMetrics : () => {};
    exports.displayCompletionReport = typeof displayCompletionReport !== 'undefined' ? displayCompletionReport : () => {};
    exports.downloadProjectReport = typeof downloadProjectReport !== 'undefined' ? downloadProjectReport : () => {};
  
    // Funding Reports
    exports.generateFundingReport = typeof generateFundingReport !== 'undefined' ? generateFundingReport : () => {};
    exports.displayFundingReport = typeof displayFundingReport !== 'undefined' ? displayFundingReport : () => {};
    exports.downloadFundingReport = typeof downloadFundingReport !== 'undefined' ? downloadFundingReport : () => {};
    exports.formatCurrency = typeof formatCurrency !== 'undefined' ? formatCurrency : () => {};
  }
  
