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


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(app);

// Function to display user information
function displayUserInfo(user) {
    // Get DOM elements
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userAvatarElement = document.getElementById('user-avatar');
    
    // Set user information
    userNameElement.textContent = `Welcome, ${user.displayName || 'User'}!`;
    userEmailElement.textContent = user.email || '';
    
    // Set profile picture or default avatar   
    if (user.photoURL) {
        userAvatarElement.src = user.photoURL;
    } else {
        userAvatarElement.src = '../images/default-avatar.png';
    }
    
    // Update page title with user's name
    document.title = `${user.displayName || 'User'} | ScholarSphere`;
}

// Function to handle logout
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                // Clear session storage
                sessionStorage.removeItem('user');
                // Redirect to landing page
                window.location.href = '../html/landingPage.html';
            }).catch((error) => {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            });
        });
    }
}

// Main function to check auth state and initialize dashboard
function initDashboard() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log('Authenticated user:', user);
            
            // Get the user's ID token to check custom claims (roles)
            user.getIdTokenResult().then((idTokenResult) => {
                // Get the role from custom claims (default to 'researcher' if not set)
                const role = idTokenResult.claims.role || 'researcher';
                
                // Store user data in session storage
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: role
                };
                sessionStorage.setItem('user', JSON.stringify(userData));
                
                // Display user info
                displayUserInfo(user);
                
                // Check if user is on the correct dashboard based on their role
                const currentPath = window.location.pathname;
                let shouldRedirect = false;
                let correctPath = '';
                
                // Determine the correct dashboard path based on role
                switch(role) {
                    case 'admin':
                        correctPath = '../html/admin-dashboard.html';
                        break;
                    case 'reviewer':
                        correctPath = '../html/reviewer-dashboard.html';
                        break;
                    default: // researcher
                        correctPath = '../html/dashboard.html';
                }
                
                // Redirect if not on the correct dashboard
                if (!currentPath.endsWith(correctPath)) {
                    window.location.href = correctPath;
                    return; // Stop further execution
                }
                
                // Customize dashboard based on role
                customizeDashboard(role);
                
            }).catch((error) => {
                console.error('Error getting ID token:', error);
            });
            
        } else {
            // User is signed out, redirect to login
            console.log('No user signed in');
            window.location.href = '../html/login.html';
        }
    });
    
    // Setup logout button
    setupLogout();
}

// Function to customize dashboard based on user role
function customizeDashboard(role) {
    // Get elements that might need role-based customization
    const welcomeHeader = document.querySelector('.welcome-header h2');
    const quickActions = document.querySelector('.quick-actions');
    
    // Update welcome message based on role
    if (welcomeHeader) {
        switch(role) {
            case 'admin':
                welcomeHeader.textContent = 'Welcome to Admin Dashboard';
                break;
            case 'reviewer':
                welcomeHeader.textContent = 'Welcome to Reviewer Dashboard';
                break;
            default:
                welcomeHeader.textContent = 'Welcome to Researcher Dashboard';
        }
    }
    
    // Customize quick actions based on role
    if (quickActions) {
        switch(role) {
            case 'admin':
                // Admin-specific actions
                quickActions.innerHTML = `
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-users-cog"></i>
                        </div>
                        <h3>Manage Users</h3>
                        <p>View and manage all system users</p>
                        <button class="action-btn">Manage</button>
                    </div>
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <h3>System Settings</h3>
                        <p>Configure platform settings</p>
                        <button class="action-btn">Configure</button>
                    </div>
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <h3>View Analytics</h3>
                        <p>View platform-wide analytics</p>
                        <button class="action-btn">View</button>
                    </div>
                `;
                break;
            case 'reviewer':
                // Reviewer-specific actions
                quickActions.innerHTML = `
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-clipboard-check"></i>
                        </div>
                        <h3>Pending Reviews</h3>
                        <p>Review submitted research papers</p>
                        <button class="action-btn">Review</button>
                    </div>
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-history"></i>
                        </div>
                        <h3>Review History</h3>
                        <p>View your past reviews</p>
                        <button class="action-btn">View</button>
                    </div>
                    <div class="action-card">
                        <div class="action-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <h3>Provide Feedback</h3>
                        <p>Submit feedback on papers</p>
                        <button class="action-btn">Submit</button>
                    </div>
                `;
                break;
            default:
                // Default researcher actions (already in HTML)
                break;
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);