/**
 * ScholarSphere Notifications System
 * 
 * A modular, reusable notification system that works across all pages
 * and properly integrates with Firebase Firestore.
 */

// Define the NotificationManager class globally
class NotificationManager {
    constructor() {
        // Initialize properties
        this.unreadCount = 0;
        this.notificationsList = null;
        this.notificationBadge = null;
        this.unsubscribeListeners = [];
        this.initialized = false;
        this.currentUser = null;
        this.firebase = null;
        this.db = null;
        this.auth = null;
        this.isCollaborationsPage = window.location.pathname.includes('collaborations.html');
        
        // Month names for date formatting
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }
    
    /**
     * Initialize the notification system
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing notification system...');
        
        // Get Firebase instances
        this.firebase = window.firebase;
        if (!this.firebase) {
            console.error('Firebase not found. Make sure Firebase is loaded before notifications.js');
            return;
        }
        
        this.auth = this.firebase.auth();
        this.db = this.firebase.firestore();
        
        // Find DOM elements
        this.notificationBadge = document.querySelector('.notification-badge');
        
        // Only find notification list if we're on the collaborations page
        if (this.isCollaborationsPage) {
            this.notificationsList = document.querySelector('.notification-list');
            this.setupTabNavigation();
        }
        
        // Set up auth state listener
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.setupNotificationListeners();
                
                // Only load notifications if we're on the collaborations page
                if (this.isCollaborationsPage && this.notificationsList) {
                    // Check if we're on the notifications tab
                    if (window.location.hash === '#notifications') {
                        this.loadNotifications();
                    }
                }
            } else {
                this.clearNotifications();
                this.unsubscribeAll();
                this.currentUser = null;
            }
        });
        
        // Request permission for browser notifications
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
        
        // Set up notification bell click handler
        const notificationBell = document.querySelector('.notifications');
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                if (!this.isCollaborationsPage) {
                    // If not on collaborations page, redirect to it with notifications hash
                    window.location.href = 'collaborations.html#notifications';
                } else {
                    // If already on collaborations page, just show the notifications tab
                    e.preventDefault();
                    window.location.hash = '#notifications';
                    this.showNotificationsTab();
                    this.loadNotifications();
                }
            });
        }
        
        this.initialized = true;
    }
    
    /**
     * Set up real-time listeners for new notifications
     */
    setupNotificationListeners() {
        if (!this.currentUser) return;
        
        console.log('Setting up notification listeners for user:', this.currentUser.uid);
        
        // Unsubscribe from any existing listeners
        this.unsubscribeAll();
        
        try {
            // Listen for all notifications for this user
            const notificationsListener = this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .onSnapshot(snapshot => {
                    // Handle changes in real-time
                    snapshot.docChanges().forEach(change => {
                        const notification = {
                            id: change.doc.id,
                            ...change.doc.data()
                        };
                        
                        if (change.type === 'added') {
                            // New notification
                            this.handleNewNotification(notification);
                        } else if (change.type === 'modified') {
                            // Updated notification (e.g., marked as read)
                            this.handleUpdatedNotification(notification);
                        } else if (change.type === 'removed') {
                            // Removed notification
                            this.handleRemovedNotification(notification.id);
                        }
                    });
                    
                    // Update unread count
                    this.updateUnreadCount();
                }, error => {
                    console.error('Error in notifications listener:', error);
                });
                
            this.unsubscribeListeners.push(notificationsListener);
        } catch (error) {
            console.error('Error setting up notification listeners:', error);
        }
    }
    
    /**
     * Update the unread count based on current notifications
     */
    async updateUnreadCount() {
        if (!this.currentUser) return;
        
        try {
            const unreadSnapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();
            
            this.unreadCount = unreadSnapshot.size;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }
    
    /**
     * Handle a new notification
     */
    handleNewNotification(notification) {
        console.log('New notification received:', notification);
        
        // Show browser notification if supported
        this.showBrowserNotification(notification);
        
        // Update the UI if the notifications list is visible and we're on the collaborations page
        if (this.isCollaborationsPage && this.notificationsList && this.isNotificationsTabActive()) {
            // Force a reload of all notifications to ensure proper order
            this.loadNotifications();
        }
    }
    
    /**
     * Handle an updated notification
     */
    handleUpdatedNotification(notification) {
        console.log('Notification updated:', notification);
        
        // Update the UI if the notifications list is visible
        if (this.isCollaborationsPage && this.notificationsList) {
            const existingItem = document.querySelector(`.notification-item[data-id="${notification.id}"]`);
            if (existingItem) {
                // If the notification is now read, update the UI
                if (notification.read) {
                    existingItem.classList.remove('unread');
                    const markReadBtn = existingItem.querySelector('.mark-read-btn');
                    if (markReadBtn) markReadBtn.remove();
                }
            }
        }
    }
    
    /**
     * Handle a removed notification
     */
    handleRemovedNotification(notificationId) {
        console.log('Notification removed:', notificationId);
        
        // Remove from UI if visible
        if (this.isCollaborationsPage && this.notificationsList) {
            const existingItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (existingItem) {
                existingItem.remove();
            }
        }
    }
    
    /**
     * Show a browser notification
     */
    showBrowserNotification(notification) {
        // Check if browser notifications are supported and permitted
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notifications");
            return;
        }
        
        if (Notification.permission === "granted") {
            const title = this.getNotificationTitle(notification);
            const notif = new Notification("ScholarSphere: " + title, {
                body: notification.message,
                icon: "../images/logo.png" // Update with your logo path
            });
            
            // Open the relevant page when notification is clicked
            if (notification.link) {
                notif.onclick = function() {
                    window.open(notification.link);
                };
            }
        }
    }
    
    /**
     * Load all notifications
     */
    async loadNotifications() {
        if (!this.notificationsList || !this.currentUser) return;
        
        try {
            console.log('Loading notifications for user:', this.currentUser.uid);
            
            // Show loading state
            this.notificationsList.innerHTML = `
                <li class="loading-notifications">
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    <p>Loading notifications...</p>
                </li>
            `;
            
            // Get notifications from Firestore - without complex ordering to avoid index issues
            const notificationsSnapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .get();
                
            // Clear loading state
            this.notificationsList.innerHTML = '';
            
            if (notificationsSnapshot.empty) {
                this.showEmptyNotifications();
                return;
            }
            
            // Convert to array for sorting
            const notifications = [];
            notificationsSnapshot.forEach(doc => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by createdAt (newest first) - client-side sorting to avoid index requirements
            notifications.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                return dateB - dateA; // Newest first
            });
            
            // Clear the list before adding notifications
            this.notificationsList.innerHTML = '';
            
            // Add each notification to the list
            notifications.forEach(notification => {
                this.addNotificationToList(notification);
            });
            
            // Update unread count
            this.updateUnreadCount();
            
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showNotificationError();
        }
    }
    
    /**
     * Add a notification to the UI list
     */
    addNotificationToList(notification) {
        if (!this.notificationsList) return;
        
        const li = document.createElement('li');
        li.className = `notification-item ${notification.read ? '' : 'unread'}`;
        li.dataset.id = notification.id || '';
        
        // Format the time
        const timeString = notification.createdAt ? 
            this.formatTimeAgo(notification.createdAt.toDate ? notification.createdAt.toDate() : new Date(notification.createdAt.seconds * 1000)) : 
            'Just now';
        
        // Determine notification style based on type and status
        let notificationTitle = this.getNotificationTitle(notification);
        let notificationClass = this.getNotificationClass(notification);
        
        li.innerHTML = `
            <article class="notification-content ${notificationClass}">
                <section class="notification-details">
                    <h3>${notificationTitle}</h3>
                    <p>${notification.message}</p>
                    <footer class="notification-meta">
                        <time datetime="${notification.createdAt ? new Date(notification.createdAt.seconds * 1000).toISOString() : new Date().toISOString()}">
                            ${timeString}
                        </time>
                    </footer>
                </section>
                ${!notification.read ? `
                <button class="mark-read-btn" aria-label="Mark as read" title="Mark as read">
                    <i class="fas fa-check" aria-hidden="true"></i>
                </button>
                ` : ''}
            </article>
        `;
        
        // Only add mark as read button click handler
        const markReadBtn = li.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const success = await this.markNotificationAsRead(notification.id);
                
                if (success) {
                    li.classList.remove('unread');
                    markReadBtn.remove(); // Remove the button after marking as read
                    
                    // Update the badge count
                    this.updateUnreadCount();
                }
            });
        }
        
        // Simply append to the list - the sorting is already done
        this.notificationsList.appendChild(li);
    }
    
    /**
     * Get a title for the notification based on its type
     */
    getNotificationTitle(notification) {
        // If the notification has a title field, use it
        if (notification.title) return notification.title;
        
        // Check the message content to determine the type if not explicitly set
        const message = notification.message ? notification.message.toLowerCase() : '';
        
        // Determine notification type based on type field and message content
        if (notification.type === 'collaboration') {
            if (message.includes('requested to join')) {
                return 'New Collaboration Request';
            } else if (message.includes('accepted')) {
                return 'Collaboration Request Accepted';
            } else if (message.includes('declined') || message.includes('rejected')) {
                return 'Collaboration Request Declined';
            } else {
                return 'Collaboration Update';
            }
        } else if (notification.type === 'collaboration_response') {
            if (notification.status === 'accepted') {
                return 'Collaboration Request Accepted';
            } else if (notification.status === 'declined' || notification.status === 'rejected') {
                return 'Collaboration Request Declined';
            } else {
                return 'Collaboration Response';
            }
        }
        
        // Default title
        return 'Notification';
    }
    
    /**
     * Get CSS class for notification type
     */
    getNotificationClass(notification) {
        // Check the message content to determine the type if not explicitly set
        const message = notification.message ? notification.message.toLowerCase() : '';
        
        if (notification.type === 'collaboration') {
            if (message.includes('requested to join')) {
                return 'notification-request';
            } else if (message.includes('accepted')) {
                return 'notification-accepted';
            } else if (message.includes('declined') || message.includes('rejected')) {
                return 'notification-declined';
            }
        } else if (notification.type === 'collaboration_response') {
            if (notification.status === 'accepted') {
                return 'notification-accepted';
            } else if (notification.status === 'declined' || notification.status === 'rejected') {
                return 'notification-declined';
            }
        }
        
        return '';
    }
    
    /**
     * Mark a notification as read
     */
    async markNotificationAsRead(notificationId) {
        if (!notificationId || !this.currentUser) return false;
        
        try {
            await this.db.collection('notifications').doc(notificationId).update({
                read: true
            });
            
            console.log('Marked notification as read:', notificationId);
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
    
    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        if (!this.currentUser) return false;
        
        try {
            // Get all unread notifications without complex queries
            const unreadSnapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();
            
            if (unreadSnapshot.empty) {
                console.log('No unread notifications to mark as read');
                return true;
            }
            
            // Use a batch to update all at once
            const batch = this.db.batch();
            
            unreadSnapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            
            await batch.commit();
            
            // Update UI
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
                const markReadBtn = item.querySelector('.mark-read-btn');
                if (markReadBtn) markReadBtn.remove();
            });
            
            // Reset unread count
            this.unreadCount = 0;
            this.updateNotificationBadge();
            
            console.log('Marked all notifications as read');
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
    
    /**
     * Update the notification badge with the current unread count
     */
    updateNotificationBadge() {
        if (this.notificationBadge) {
            if (this.unreadCount > 0) {
                this.notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                this.notificationBadge.style.display = 'flex';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
    }
    
    /**
     * Show a message when there are no notifications
     */
    showEmptyNotifications() {
        if (!this.notificationsList) return;
        
        this.notificationsList.innerHTML = `
            <li class="empty-notifications">
                <i class="fas fa-bell-slash" aria-hidden="true"></i>
                <p>You don't have any notifications yet.</p>
            </li>
        `;
    }
    
    /**
     * Show an error message
     */
    showNotificationError() {
        if (!this.notificationsList) return;
        
        this.notificationsList.innerHTML = `
            <li class="notification-error">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <p>There was an error loading your notifications. Please try again later.</p>
            </li>
        `;
    }
    
    /**
     * Clear all notifications from the UI
     */
    clearNotifications() {
        if (this.notificationsList) {
            this.notificationsList.innerHTML = '';
        }
        
        this.unreadCount = 0;
        this.updateNotificationBadge();
    }
    
    /**
     * Unsubscribe from all listeners
     */
    unsubscribeAll() {
        this.unsubscribeListeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.unsubscribeListeners = [];
    }
    
    /**
     * Check if the notifications tab is currently active
     */
    isNotificationsTabActive() {
        return window.location.hash === '#notifications';
    }
    
    /**
     * Show the notifications tab
     */
    showNotificationsTab() {
        if (!this.isCollaborationsPage) return;
        
        const notificationsSection = document.getElementById('notifications');
        if (notificationsSection) {
            // Hide all content sections
            document.querySelectorAll('.collaboration-content').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show notifications section
            notificationsSection.style.display = 'block';
            
            // Update active tab
            document.querySelectorAll('.tabs-nav a').forEach(link => {
                link.classList.remove('active');
            });
            
            const notificationsTab = document.querySelector('.tabs-nav a[href="#notifications"]');
            if (notificationsTab) {
                notificationsTab.classList.add('active');
            }
        }
    }
    
    /**
     * Set up tab navigation for notifications
     */
    setupTabNavigation() {
        if (!this.isCollaborationsPage) return;
        
        // Add mark all as read button to the notifications section header
        const notificationsHeader = document.querySelector('#notifications .section-header');
        if (notificationsHeader && !notificationsHeader.querySelector('.mark-all-read-btn')) {
            const markAllBtn = document.createElement('button');
            markAllBtn.className = 'mark-all-read-btn';
            markAllBtn.innerHTML = '<i class="fas fa-check-double" aria-hidden="true"></i> Mark All as Read';
            markAllBtn.addEventListener('click', async () => {
                const success = await this.markAllAsRead();
                if (success) {
                    // Show success message
                    const successMsg = document.createElement('span');
                    successMsg.className = 'mark-all-success';
                    successMsg.textContent = 'All notifications marked as read';
                    markAllBtn.parentNode.appendChild(successMsg);
                    
                    // Remove success message after 3 seconds
                    setTimeout(() => {
                        successMsg.remove();
                    }, 3000);
                }
            });
            notificationsHeader.appendChild(markAllBtn);
        }
        
        // Handle tab switching
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#notifications') {
                this.loadNotifications();
            }
        });
    }
    
    /**
     * Format a date as a relative time string (e.g., "2 hours ago")
     * or as a formatted date string (e.g., "05 May 2025")
     */
    formatTimeAgo(date) {
        if (!date) return '';
        
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
        } else {
            // Format date as "DD Month YYYY"
            const day = date.getDate().toString().padStart(2, '0');
            const month = this.monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        }
    }
    
    /**
     * Public API methods that can be called from other scripts
     */
    
    /**
     * Create a new notification
     */
    async createNotification(userId, type, message, options = {}) {
        if (!userId || !type || !message) {
            console.error('Missing required parameters for createNotification');
            return false;
        }
        
        try {
            // Determine the appropriate title based on the message and type
            let title = options.title;
            if (!title) {
                if (type === 'collaboration') {
                    if (message.toLowerCase().includes('requested to join')) {
                        title = 'New Collaboration Request';
                    } else if (message.toLowerCase().includes('accepted')) {
                        title = 'Collaboration Request Accepted';
                    } else if (message.toLowerCase().includes('declined') || message.toLowerCase().includes('rejected')) {
                        title = 'Collaboration Request Declined';
                    }
                }
            }
            
            const notification = {
                userId,
                type,
                message,
                title,
                read: false,
                createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
                ...options
            };
            
            const docRef = await this.db.collection('notifications').add(notification);
            console.log('Created notification:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    }
    
    /**
     * Get unread notification count for current user
     */
    async getUnreadCount() {
        if (!this.currentUser) return 0;
        
        try {
            const snapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();
            
            return snapshot.size;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
    
    /**
     * Refresh notification badge
     */
    async refreshBadge() {
        if (!this.currentUser) return;
        
        const count = await this.getUnreadCount();
        this.unreadCount = count;
        this.updateNotificationBadge();
    }
}

// Create a global instance of the notification manager
window.ScholarSphere = window.ScholarSphere || {};
window.ScholarSphere.notifications = new NotificationManager();

// Initialize the notification system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ScholarSphere.notifications.init();
});

// Also initialize when the window loads (backup for DOMContentLoaded)
window.addEventListener('load', function() {
    if (!window.ScholarSphere.notifications.initialized) {
        window.ScholarSphere.notifications.init();
    }
});