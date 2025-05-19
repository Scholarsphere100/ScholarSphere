/**
 * inactive-users.js
 * 
 * This script identifies and manages users who have been inactive for a specified period.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const inactiveUsersTable = document.getElementById('inactiveUsersTable');
    const refreshInactiveBtn = document.getElementById('refreshInactiveBtn');
    
    // Reference to Firestore (using the existing Firebase instance)
    const db = firebase.firestore();
    
    // Load inactive users when the page loads
    loadInactiveUsers();
    
    // Add event listener for refresh button
    if (refreshInactiveBtn) {
      refreshInactiveBtn.addEventListener('click', loadInactiveUsers);
    }
   
    function formatDate(date) {
      if (!date) return 'Never';
      
      const day = date.getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    }
    
    /**
     * Load users who have been inactive for the specified period
     */
    async function loadInactiveUsers() {
      // Get the tbody element within the table
      const inactiveUsersList = inactiveUsersTable ? inactiveUsersTable.querySelector('tbody') : null;
      
      if (!inactiveUsersList) {
        console.error('Inactive users table body not found');
        return;
      }
      
      try {
        // Show loading state
        inactiveUsersList.innerHTML = `
          <tr class="loading-row">
            <td colspan="5" class="loading-cell">
              <i class="fas fa-spinner fa-spin"></i> Loading inactive users...
            </td>
          </tr>
        `;
        
        const now = new Date();
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - 180); 
        
        console.log('Cutoff date:', cutoffDate); // Debug log
        
        // Query users from Firestore
        const usersSnapshot = await db.collection('Users').get();
        
        // Filter users client-side
        const inactiveUsers = [];
        
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log('User data:', userData.name, userData.lastLogin); // Debug log
          
          // Convert Firestore timestamp to Date if it exists
          const lastLogin = userData.lastLogin ? 
            (userData.lastLogin.toDate ? userData.lastLogin.toDate() : userData.lastLogin) : 
            null;
          
          // If no lastLogin or lastLogin is older than cutoff date
          if (!lastLogin || lastLogin <= cutoffDate) {
            inactiveUsers.push({
              id: doc.id,
              name: userData.name || 'Unknown User',
              lastLogin: lastLogin,
              isResearcher: userData.isResearcher || false,
              isReviewer: userData.isReviewer || false,
              daysInactive: lastLogin ? Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24)) : 'Never logged in'
            });
          }
        });
        
        console.log('Inactive users found:', inactiveUsers.length); // Debug log
        
        // Sort by days inactive (most inactive first)
        inactiveUsers.sort((a, b) => {
          if (a.daysInactive === 'Never logged in') return -1;
          if (b.daysInactive === 'Never logged in') return 1;
          return b.daysInactive - a.daysInactive;
        });
        
        // If no inactive users found
        if (inactiveUsers.length === 0) {
          inactiveUsersList.innerHTML = `
            <tr>
              <td colspan="5" class="empty-cell">
                <i class="fas fa-check-circle"></i> No inactive users found.
              </td>
            </tr>
          `;
          return;
        }
        
        // Clear the list
        inactiveUsersList.innerHTML = '';
        
        // Add each inactive user to the list
        inactiveUsers.forEach(user => {
          const tr = document.createElement('tr');
          
          // Determine user role
          let role = '';
          if (user.isResearcher && user.isReviewer) {
            role = 'Researcher & Reviewer';
          } else if (user.isResearcher) {
            role = 'Researcher';
          } else if (user.isReviewer) {
            role = 'Reviewer';
          } else {
            role = 'User';
          }
          
          // Format last login date in "5 May 2025" format
          const lastLoginFormatted = formatDate(user.lastLogin);
          
          // Determine days inactive class based on severity
          let daysInactiveClass = '';
          if (user.daysInactive === 'Never logged in' || user.daysInactive > 365) {
            daysInactiveClass = 'status-not-started';
          } else if (user.daysInactive > 180) {
            daysInactiveClass = 'status-early';
          }
          
          tr.innerHTML = `
            <td>${user.name}</td>
            <td>${role}</td>
            <td>${lastLoginFormatted}</td>
            <td class="${daysInactiveClass}">${user.daysInactive}</td>
            <td>
              <button class="action-btn danger remove-user-btn" data-user-id="${user.id}">
                <i class="fas fa-user-times"></i> Remove
              </button>
            </td>
          `;
          
          inactiveUsersList.appendChild(tr);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-user-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            if (userId) {
              removeInactiveUser(userId, btn);
            }
          });
        });
        
      } catch (error) {
        console.error('Error loading inactive users:', error);
        inactiveUsersList.innerHTML = `
          <tr>
            <td colspan="5" class="error-cell">
              <i class="fas fa-exclamation-triangle"></i> Error loading inactive users. Please try again.
            </td>
          </tr>
        `;
      }
    }
    
    /**
     * Remove an inactive user from the system
     */
    async function removeInactiveUser(userId, buttonElement) {
      if (!userId) return;
      
      // Ask for confirmation
      if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
        return;
      }
      
      try {
        // Show loading state
        const row = buttonElement.closest('tr');
        row.classList.add('removing');
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
        buttonElement.disabled = true;
        
        // Delete the user document
        await db.collection('Users').doc(userId).delete();
        
        // Remove the row with animation
        row.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        setTimeout(() => {
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            
            // Show empty message if no more users
            const tbody = document.querySelector('#inactiveUsersTable tbody');
            if (tbody && tbody.children.length === 0) {
              tbody.innerHTML = `
                <tr>
                  <td colspan="5" class="empty-cell">
                    <i class="fas fa-check-circle"></i> No inactive users found.
                  </td>
                </tr>
              `;
            }
          }, 300);
        }, 300);
        
      } catch (error) {
        console.error('Error removing user:', error);
        alert('Failed to remove user. Please try again.');
        
        // Reset button
        buttonElement.innerHTML = '<i class="fas fa-user-times"></i> Remove';
        buttonElement.disabled = false;
        
        // Remove loading state
        const row = buttonElement.closest('tr');
        row.classList.remove('removing');
      }
    }
  });