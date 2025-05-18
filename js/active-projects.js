/**
 * active-projects.js
 * 
 * This script fetches active research projects from Firebase
 * and displays them in the active projects table.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get reference to the active projects table
    const activeProjectsTable = document.getElementById('activeProjectsTable');
    const refreshProjectsBtn = document.getElementById('refreshProjectsBtn');
    
    // Reference to Firestore (using the existing Firebase instance)
    const db = firebase.firestore();
    
    // Fetch and display active projects
    fetchActiveProjects();
    
    /**
     * Fetches active projects from Firestore and displays them
     */
    async function fetchActiveProjects() {
      try {
        // Show loading state
        if (activeProjectsTable) {
          const tbody = activeProjectsTable.querySelector('tbody');
          if (tbody) {
            tbody.innerHTML = `
              <tr>
                <td colspan="4" class="loading-cell">
                  <i class="fas fa-spinner fa-spin"></i> Loading active projects...
                </td>
              </tr>
            `;
          }
        }
        
        // Get all projects
        const projectsSnapshot = await db.collection('projects').get();
        
        // Get all milestones for progress calculation
        const milestonesSnapshot = await db.collection('milestones').get();
        
        // Group milestones by project
        const milestonesByProject = {};
        milestonesSnapshot.forEach(doc => {
          const milestone = doc.data();
          if (milestone.projectId) {
            if (!milestonesByProject[milestone.projectId]) {
              milestonesByProject[milestone.projectId] = [];
            }
            milestonesByProject[milestone.projectId].push(milestone);
          }
        });
        
        // Process projects
        const activeProjects = [];
        
        projectsSnapshot.forEach(doc => {
          const project = doc.data();
          project.id = doc.id;
          
          // Calculate project progress
          const projectMilestones = milestonesByProject[doc.id] || [];
          const totalMilestones = projectMilestones.length;
          let completedMilestones = 0;
          let totalProgress = 0;
          
          projectMilestones.forEach(milestone => {
            if (milestone.status === 'completed') {
              completedMilestones++;
            }
            totalProgress += milestone.progress || 0;
          });
          
          const progress = totalMilestones > 0 
            ? Math.round(totalProgress / totalMilestones) 
            : 0;
          
          // Determine project status
          let status = 'Active';
          if (project.status) {
            status = project.status.charAt(0).toUpperCase() + project.status.slice(1);
          } else if (progress === 100) {
            status = 'Completed';
          } else if (progress === 0) {
            status = 'Not Started';
          } else if (progress < 25) {
            status = 'Early Stage';
          } else if (progress >= 75) {
            status = 'Advanced';
          }
          
          // Add to active projects array
          activeProjects.push({
            id: project.id,
            title: project.title || 'Untitled Project',
            participants: project.collaborators ? project.collaborators.length : 0,
            progress: progress,
            status: status
          });
        });
        
        // Sort projects by progress (highest first)
        activeProjects.sort((a, b) => b.progress - a.progress);
        
        // Display active projects
        displayActiveProjects(activeProjects);
        
      } catch (error) {
        console.error('Error fetching active projects:', error);
        
        // Show error message
        if (activeProjectsTable) {
          const tbody = activeProjectsTable.querySelector('tbody');
          if (tbody) {
            tbody.innerHTML = `
              <tr>
                <td colspan="4" class="error-cell">
                  <i class="fas fa-exclamation-triangle"></i> Error loading projects. Please try again.
                </td>
              </tr>
            `;
          }
        }
      }
    }
    
    /**
     * Displays active projects in the table
     * @param {Array} projects - Array of project objects
     */
    function displayActiveProjects(projects) {
      if (!activeProjectsTable) return;
      
      const tbody = activeProjectsTable.querySelector('tbody');
      if (!tbody) return;
      
      // Clear loading message
      tbody.innerHTML = '';
      
      // Check if there are any projects
      if (projects.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="empty-cell">
              No active projects found.
            </td>
          </tr>
        `;
        return;
      }
      
      // Add each project to the table
      projects.forEach(project => {
        const row = document.createElement('tr');
        
        // Determine status class
        let statusClass = 'status-active';
        if (project.status === 'Completed') {
          statusClass = 'status-completed';
        } else if (project.status === 'Not Started') {
          statusClass = 'status-not-started';
        } else if (project.status === 'Early Stage') {
          statusClass = 'status-early';
        } else if (project.status === 'Advanced') {
          statusClass = 'status-advanced';
        }
        
        // Create table row
        row.innerHTML = `
          <td>${project.title}</td>
          <td>${project.participants}</td>
          <td>
            <section class="progress-container">
              <section class="progress-bar" style="width: ${project.progress}%"></section>
              <span class="progress-text">${project.progress}%</span>
            </section>
          </td>
          <td><mark class="status-badge ${statusClass}">${project.status}</mark></td>
        `;
        
        tbody.appendChild(row);
      });
    }
    
    // Add refresh button functionality
    if (refreshProjectsBtn) {
      refreshProjectsBtn.addEventListener('click', fetchActiveProjects);
    }
  });