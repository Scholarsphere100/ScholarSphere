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

// Create a CommentsManager class to handle all comment functionality
class CommentsManager {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.currentUser = null;
        this.projectId = null;
        this.commentsList = null;
        this.commentForm = null;
        this.initialized = false;
        this.unsubscribeListeners = [];
    }

    /**
     * Initialize the comments system
     * @param {string} projectId - The ID of the project to load comments for
     * @param {string} commentsListSelector - CSS selector for the comments list container
     * @param {string} commentFormSelector - CSS selector for the comment form
     */
    init(projectId, commentsListSelector = '.comments-list', commentFormSelector = '.comment-form') {
        if (this.initialized) return;

        console.log('Initializing comments system for project:', projectId);

        this.projectId = projectId;
        this.commentsList = document.querySelector(commentsListSelector);
        this.commentForm = document.querySelector(commentFormSelector);

        if (!this.commentsList) {
            console.error('Comments list container not found:', commentsListSelector);
            return;
        }

        if (!this.commentForm) {
            console.error('Comment form not found:', commentFormSelector);
            return;
        }

        // Set up auth state listener
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.setupCommentForm();
                this.loadComments();
            } else {
                this.currentUser = null;
                this.disableCommentForm('Please sign in to add comments');
                this.clearComments();
                this.unsubscribeAll();
            }
        });

        this.initialized = true;
    }

    /**
     * Set up the comment form
     */
    setupCommentForm() {
        // Clear any existing listeners
        const newForm = this.commentForm.cloneNode(true);
        this.commentForm.parentNode.replaceChild(newForm, this.commentForm);
        this.commentForm = newForm;

        // Enable the form
        const textarea = this.commentForm.querySelector('textarea');
        const submitButton = this.commentForm.querySelector('button[type="submit"]');
        
        if (textarea) {
            textarea.disabled = false;
            textarea.placeholder = 'Write your comment here...';
        }
        
        if (submitButton) {
            submitButton.disabled = false;
        }

        // Add submit event listener
        this.commentForm.addEventListener('submit', this.handleCommentSubmit.bind(this));
    }

    /**
     * Disable the comment form with a message
     * @param {string} message - Message to display in the textarea
     */
    disableCommentForm(message = 'Comments are disabled') {
        const textarea = this.commentForm.querySelector('textarea');
        const submitButton = this.commentForm.querySelector('button[type="submit"]');
        
        if (textarea) {
            textarea.disabled = true;
            textarea.placeholder = message;
        }
        
        if (submitButton) {
            submitButton.disabled = true;
        }
    }

    /**
     * Handle comment form submission
     * @param {Event} event - The form submit event
     */
    async handleCommentSubmit(event) {
        event.preventDefault();

        if (!this.currentUser) {
            alert('You must be signed in to add comments');
            return;
        }

        const textarea = this.commentForm.querySelector('textarea');
        if (!textarea) return;

        const commentText = textarea.value.trim();
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }

        try {
            // Disable the form while submitting
            const submitButton = this.commentForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Posting...';
            }

            // Get user data
            const userDoc = await this.db.collection('Users').doc(this.currentUser.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            // Create the comment
            await this.db.collection('projects').doc(this.projectId)
                .collection('comments').add({
                    text: commentText,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: this.currentUser.uid,
                    userName: userData.name || userData.displayName || this.currentUser.displayName || 'Anonymous',
                    userRole: userData.isResearcher ? 'Researcher' : 
                             userData.isReviewer ? 'Reviewer' : 'Collaborator',
                    userPhotoURL: userData.photoURL || this.currentUser.photoURL || null,
                    isEdited: false
                });

            // Update project's lastUpdated timestamp
            await this.db.collection('projects').doc(this.projectId).update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reset the form
            textarea.value = '';
            
            // Re-enable the submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Post Comment';
            }

            console.log('Comment posted successfully');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
            
            // Re-enable the submit button
            const submitButton = this.commentForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Post Comment';
            }
        }
    }

    /**
     * Load comments for the current project
     */
    async loadComments() {
        if (!this.projectId || !this.commentsList) return;

        try {
            console.log('Loading comments for project:', this.projectId);

            // Show loading state
            this.commentsList.innerHTML = `
                <li class="loading-comments">
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    <p>Loading comments...</p>
                </li>
            `;

            // Set up real-time listener for comments
            const commentsListener = this.db.collection('projects').doc(this.projectId)
                .collection('comments')
                .orderBy('createdAt', 'desc') // Newest first
                .onSnapshot(snapshot => {
                    // Clear the list
                    this.commentsList.innerHTML = '';

                    if (snapshot.empty) {
                        this.showEmptyComments();
                        return;
                    }

                    // Add each comment to the list
                    snapshot.forEach(doc => {
                        const comment = {
                            id: doc.id,
                            ...doc.data()
                        };
                        this.addCommentToList(comment);
                    });
                }, error => {
                    console.error('Error in comments listener:', error);
                    this.showCommentsError();
                });

            // Store the unsubscribe function
            this.unsubscribeListeners.push(commentsListener);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showCommentsError();
        }
    }

    /**
     * Add a comment to the UI list
     * @param {Object} comment - The comment data
     */
    addCommentToList(comment) {
        if (!this.commentsList) return;

        const li = document.createElement('li');
        li.className = 'comment-item';
        li.dataset.id = comment.id;

        // Format the time
        const timeString = comment.createdAt ? 
            this.formatTimeAgo(comment.createdAt.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt.seconds * 1000)) : 
            'Just now';

        // Check if the current user is the comment author
        const isAuthor = this.currentUser && comment.userId === this.currentUser.uid;

        li.innerHTML = `
            <article class="comment">
                <header class="commenter-info">
                    <img src="${comment.userPhotoURL || 'https://via.placeholder.com/40'}" alt="${comment.userName}" class="commenter-avatar">
                    <section class="commenter-details">
                        <h3>${comment.userName}</h3>
                        <p class="commenter-role">${comment.userRole || 'Collaborator'}</p>
                    </section>
                </header>
                <section class="comment-content">
                    <p>${this.formatCommentText(comment.text)}</p>
                </section>
                <footer class="comment-meta">
                    <time datetime="${comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toISOString() : new Date().toISOString()}">
                        ${timeString}
                    </time>
                    ${comment.isEdited ? '<span class="edited-indicator">(edited)</span>' : ''}
                    <section class="comment-actions">
                        <button class="reply-btn" aria-label="Reply to comment">
                            <i class="fas fa-reply" aria-hidden="true"></i> Reply
                        </button>
                        ${isAuthor ? `
                        <button class="edit-comment-btn" aria-label="Edit comment">
                            <i class="fas fa-edit" aria-hidden="true"></i> Edit
                        </button>
                        <button class="delete-comment-btn" aria-label="Delete comment">
                            <i class="fas fa-trash-alt" aria-hidden="true"></i> Delete
                        </button>
                        ` : ''}
                    </section>
                </footer>
            </article>
        `;

        // Add event listeners
        const replyBtn = li.querySelector('.reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                this.handleReplyClick(comment);
            });
        }

        const editBtn = li.querySelector('.edit-comment-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.handleEditClick(comment, li);
            });
        }

        const deleteBtn = li.querySelector('.delete-comment-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteClick(comment.id);
            });
        }

        // Add to the list
        this.commentsList.appendChild(li);
    }

    /**
     * Format comment text with links and mentions
     * @param {string} text - The comment text
     * @returns {string} - Formatted HTML
     */
    formatCommentText(text) {
        if (!text) return '';

        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);

        // Convert @mentions to spans
        const mentionRegex = /@(\w+)/g;
        text = text.replace(mentionRegex, (match, username) => `<span class="mention">@${username}</span>`);

        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    /**
     * Handle reply button click
     * @param {Object} comment - The comment being replied to
     */
    handleReplyClick(comment) {
        const textarea = this.commentForm.querySelector('textarea');
        if (textarea) {
            textarea.value = `@${comment.userName} `;
            textarea.focus();
            
            // Scroll to comment form
            this.commentForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Handle edit button click
     * @param {Object} comment - The comment to edit
     * @param {HTMLElement} commentElement - The comment list item element
     */
    async handleEditClick(comment, commentElement) {
        // Create edit form
        const commentContent = commentElement.querySelector('.comment-content');
        const originalContent = commentContent.innerHTML;
        
        commentContent.innerHTML = `
            <form class="edit-comment-form">
                <textarea class="edit-comment-textarea" rows="3">${comment.text}</textarea>
                <section class="edit-actions">
                    <button type="submit" class="save-edit-btn">Save</button>
                    <button type="button" class="cancel-edit-btn">Cancel</button>
                </section>
            </form>
        `;
        
        const editForm = commentContent.querySelector('.edit-comment-form');
        const textarea = commentContent.querySelector('.edit-comment-textarea');
        const saveBtn = commentContent.querySelector('.save-edit-btn');
        const cancelBtn = commentContent.querySelector('.cancel-edit-btn');
        
        // Focus the textarea
        textarea.focus();
        
        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            commentContent.innerHTML = originalContent;
        });
        
        // Handle save
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newText = textarea.value.trim();
            if (!newText) {
                alert('Comment cannot be empty');
                return;
            }
            
            try {
                // Update the comment in Firestore
                await this.db.collection('projects').doc(this.projectId)
                    .collection('comments').doc(comment.id).update({
                        text: newText,
                        isEdited: true,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                // The real-time listener will update the UI
            } catch (error) {
                console.error('Error updating comment:', error);
                alert('Failed to update comment. Please try again.');
                commentContent.innerHTML = originalContent;
            }
        });
    }

    /**
     * Handle delete button click
     * @param {string} commentId - The ID of the comment to delete
     */
    async handleDeleteClick(commentId) {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                await this.db.collection('projects').doc(this.projectId)
                    .collection('comments').doc(commentId).delete();
                
                // The real-time listener will update the UI
                console.log('Comment deleted successfully');
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('Failed to delete comment. Please try again.');
            }
        }
    }

    /**
     * Show a message when there are no comments
     */
    showEmptyComments() {
        if (!this.commentsList) return;
        
        this.commentsList.innerHTML = `
            <li class="empty-comments">
                <i class="fas fa-comments" aria-hidden="true"></i>
                <p>No comments yet. Be the first to comment!</p>
            </li>
        `;
    }

    /**
     * Show an error message
     */
    showCommentsError() {
        if (!this.commentsList) return;
        
        this.commentsList.innerHTML = `
            <li class="comments-error">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <p>There was an error loading comments. Please try again later.</p>
            </li>
        `;
    }

    /**
     * Clear all comments from the UI
     */
    clearComments() {
        if (this.commentsList) {
            this.commentsList.innerHTML = '';
        }
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
     * Format a date as a relative time string (e.g., "2 hours ago")
     * @param {Date} date - The date to format
     * @returns {string} - Formatted date string
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
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        }
    }
}

// Create a global instance of the comments manager
window.ScholarSphere = window.ScholarSphere || {};
window.ScholarSphere.comments = new CommentsManager();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (projectId) {
        window.ScholarSphere.comments.init(projectId);
    } else {
        console.error('No project ID found in URL');
    }
});