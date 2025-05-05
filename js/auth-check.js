document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const currentPageRole = 'researcher'; // Change this per page
    
    /*if (!userData) {
      // Not logged in
      window.location.href = '../index.html';
      return;
    }
    */
    
    if (userData.role !== currentPageRole) {
      // Wrong role - redirect to their proper dashboard
      switch(userData.role) {
        case 'admin':
          window.location.href = '../admin-dashboard.html';
          break;
        case 'reviewer':
          window.location.href = '../reviewer-dashboard.html';
          break;
        default:
          window.location.href = '../researcher-dashboard.html';
      }
      return;
    }
    
    // User has correct role - proceed to load page
    displayUserSpecificContent(userData);
  });