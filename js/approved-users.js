/**
 * approved-users.js
 * 
 * This script fetches approved researchers and reviewers from Firebase,
 * displays them in the relevant sections, and updates the approval rate pie chart.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const approvedResearchersList = document.getElementById('approvedResearchers');
    const approvedReviewersList = document.getElementById('approvedReviewers');
    const circleProgress = document.getElementById('circleProgress');
    const percentageText = document.getElementById('percentageText');
    
    // Initialize counters for statistics
    let approvedCount = 0;
    let rejectedCount = 0;
    
    // Reference to Firestore (using the existing Firebase instance)
    const db = firebase.firestore();
    
    // Fetch and display approved users
    fetchApprovedUsers();
    
    /**
     * Fetches approved users from Firestore and displays them
     */
    async function fetchApprovedUsers() {
      try {
        // Clear existing lists
        if (approvedResearchersList) approvedResearchersList.innerHTML = '<li class="loading">Loading approved researchers...</li>';
        if (approvedReviewersList) approvedReviewersList.innerHTML = '<li class="loading">Loading approved reviewers...</li>';
        
        // Get all users
        const usersSnapshot = await db.collection('Users').get();
        
        // Reset counters
        approvedCount = 0;
        rejectedCount = 0;
        
        // Process users
        const approvedResearchers = [];
        const approvedReviewers = [];
        
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          
          // Count for statistics
          if (userData.isAccepted === true) {
            approvedCount++;
          } else if (userData.isAccepted === false && userData.isPending === false) {
            rejectedCount++;
          }
          
          // Check if user is an approved researcher
          if (userData.isResearcher && userData.isAccepted === true && !userData.isPending) {
            approvedResearchers.push({
              id: doc.id,
              name: userData.name || 'Unknown User',
              email: userData.email || ''
            });
          }
          
          // Check if user is an approved reviewer
          if (userData.isReviewer && userData.isAccepted === true && !userData.isPending) {
            approvedReviewers.push({
              id: doc.id,
              name: userData.name || 'Unknown User',
              email: userData.email || ''
            });
          }
        });
        
        // Sort by name
        approvedResearchers.sort((a, b) => a.name.localeCompare(b.name));
        approvedReviewers.sort((a, b) => a.name.localeCompare(b.name));
        
        // Display approved researchers
        displayApprovedUsers(approvedResearchersList, approvedResearchers, 'researcher');
        
        // Display approved reviewers
        displayApprovedUsers(approvedReviewersList, approvedReviewers, 'reviewer');
        
        // Update the pie chart
        updateApprovalRateChart();
        
      } catch (error) {
        console.error('Error fetching approved users:', error);
        
        // Show error message
        if (approvedResearchersList) {
          approvedResearchersList.innerHTML = '<li class="error">Error loading approved researchers. Please try again.</li>';
        }
        
        if (approvedReviewersList) {
          approvedReviewersList.innerHTML = '<li class="error">Error loading approved reviewers. Please try again.</li>';
        }
      }
    }
    
    /**
     * Displays approved users in the specified list element
     * @param {HTMLElement} listElement - The list element to populate
     * @param {Array} users - Array of user objects
     * @param {string} userType - Type of user ('researcher' or 'reviewer')
     */
    function displayApprovedUsers(listElement, users, userType) {
      if (!listElement) return;
      
      // Clear loading message
      listElement.innerHTML = '';
      
      // Check if there are any users
      if (users.length === 0) {
        listElement.innerHTML = `<li class="empty">No approved ${userType}s found.</li>`;
        return;
      }
      
      // Add each user to the list
      users.forEach(user => {
        const li = document.createElement('li');
        
        // Create user item with name only (no date as requested)
        li.innerHTML = `<p>${user.name}</p>`;
        
        listElement.appendChild(li);
      });
    }
    
    /**
     * Updates the approval rate pie chart
     */
    function updateApprovalRateChart() {
      if (!circleProgress || !percentageText) return;
      
      const total = approvedCount + rejectedCount;
      let percent = 0;
      
      if (total > 0) {
        percent = Math.round((approvedCount / total) * 100);
      }
      
      // Update the circle progress
      circleProgress.setAttribute('stroke-dasharray', `${percent}, 100`);
      
      // Update the percentage text
      percentageText.textContent = `${percent}%`;
    }
    
    // Add refresh button functionality
    const refreshApprovedResearchersBtn = document.getElementById('refreshApprovedResearchersBtn');
    if (refreshApprovedResearchersBtn) {
      refreshApprovedResearchersBtn.addEventListener('click', fetchApprovedUsers);
    }
    
    const refreshApprovedReviewersBtn = document.getElementById('refreshApprovedReviewersBtn');
    if (refreshApprovedReviewersBtn) {
      refreshApprovedReviewersBtn.addEventListener('click', fetchApprovedUsers);
    }
  });