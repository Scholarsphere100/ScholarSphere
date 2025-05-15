/**
 * notificationCount.js
 * 
 * A lightweight module for handling notification counts and badges in ScholarSphere.
 * This can be included in any page that needs to display notification counts
 * without the full notification system.
 */

// Define the NotificationCounter class
class NotificationCounter {
    constructor() {
        // Initialize properties
        this.unreadCount = 0;
        this.notificationBadges = [];
        this.currentUser = null;
        this.firebase = null;
        this.db = null;
        this.auth = null;
        this.unsubscribeListener = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the notification counter
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing notification counter...');
        
        // Get Firebase instances
        this.firebase = window.firebase;
        if (!this.firebase) {
            console.error('Firebase not found. Make sure Firebase is loaded before notificationCount.js');
            return;
        }
        
        this.auth = this.firebase.auth();
        this.db = this.firebase.firestore();
        
        // Find all notification badges in the document
        this.findNotificationBadges();
        
        // Set up auth state listener
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.setupNotificationCountListener();
            } else {
                this.clearNotificationCount();
                this.unsubscribeFromListener();
                this.currentUser = null;
            }
        });
        
        // Set up window focus event to refresh counts when tab becomes active
        window.addEventListener('focus', () => {
            if (this.currentUser) {
                this.refreshCount();
            }
        });
        
        this.initialized = true;
    }
    
    /**
     * Find all notification badges in the document
     */
    findNotificationBadges() {
        this.notificationBadges = Array.from(document.querySelectorAll('.notification-badge'));
        
        // If no badges found, check again after a short delay (for dynamically loaded content)
        if (this.notificationBadges.length === 0) {
            setTimeout(() => {
                this.notificationBadges = Array.from(document.querySelectorAll('.notification-badge'));
                this.updateNotificationBadges();
            }, 500);
        }
    }
    
    /**
     * Set up real-time listener for notification count
     */
    setupNotificationCountListener() {
        if (!this.currentUser) return;
        
        console.log('Setting up notification count listener for user:', this.currentUser.uid);
        
        // Unsubscribe from any existing listener
        this.unsubscribeFromListener();
        
        try {
            // Listen for unread notifications count
            this.unsubscribeListener = this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .onSnapshot(snapshot => {
                    this.unreadCount = snapshot.size;
                    this.updateNotificationBadges();
                }, error => {
                    console.error('Error in notification count listener:', error);
                });
        } catch (error) {
            console.error('Error setting up notification count listener:', error);
        }
    }
    
    /**
     * Update all notification badges with the current unread count
     */
    updateNotificationBadges() {
        // Find badges again in case new ones were added to the DOM
        if (this.notificationBadges.length === 0) {
            this.findNotificationBadges();
        }
        
        this.notificationBadges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    /**
     * Clear notification count
     */
    clearNotificationCount() {
        this.unreadCount = 0;
        this.updateNotificationBadges();
    }
    
    /**
     * Unsubscribe from the notification count listener
     */
    unsubscribeFromListener() {
        if (typeof this.unsubscribeListener === 'function') {
            this.unsubscribeListener();
            this.unsubscribeListener = null;
        }
    }
    
    /**
     * Refresh notification count manually
     */
    async refreshCount() {
        if (!this.currentUser) return;
        
        try {
            const snapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();
            
            this.unreadCount = snapshot.size;
            this.updateNotificationBadges();
        } catch (error) {
            console.error('Error refreshing notification count:', error);
        }
    }
    
    /**
     * Get the current unread count
     * @returns {number} The number of unread notifications
     */
    getUnreadCount() {
        return this.unreadCount;
    }
}

// Create a global instance of the notification counter
window.ScholarSphere = window.ScholarSphere || {};
window.ScholarSphere.notificationCounter = new NotificationCounter();

// Initialize the notification counter when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ScholarSphere.notificationCounter.init();
});

// Also initialize when the window loads (backup for DOMContentLoaded)
window.addEventListener('load', function() {
    if (!window.ScholarSphere.notificationCounter.initialized) {
        window.ScholarSphere.notificationCounter.init();
    }
});

// Export the counter instance for use in other modules
export default window.ScholarSphere.notificationCounter;