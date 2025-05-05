document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const viewer = document.getElementById('project-viewer');
  const titleBox = document.getElementById('project-title');
  const descBox = document.getElementById('project-description');
  const commentBox = document.getElementById('project-comment-input');
  const submitBtn = document.getElementById('submit-project-comment');
  const requestList = document.getElementById('request-list');
  const assignedList = document.getElementById('assigned-projects-list');
  const reviewedCount = document.getElementById('projects-reviewed');
  const pendingCount = document.getElementById('projects-pending');
  const commentsCount = document.getElementById('comments-given');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const closeSidebar = document.querySelector('.close-sidebar');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const dashboardContainer = document.querySelector('.dashboard-container');

  // State variables
  let reviewed = 2;
  let pending = requestList.children.length;
  let comments = 0;
  let initialPending = requestList.children.length;
  let allProjects = [];

  // Project data
  const projectData = {
    101: {
      title: 'Neural Network Optimization',
      description: 'Analyze and review optimization algorithms used in training deep neural networks.',
      objectives: 'Improve convergence speed and accuracy of training models.',
      skills: ['Python', 'TensorFlow', 'Gradient Descent', 'Statistics'],
      timeline: 'May 2025 – August 2025'
    },
    102: {
      title: 'Risk Management Using AI',
      description: 'Analyze and review optimization risks using AI tools.',
      objectives: 'Analyze and manage risks.',
      skills: ['Python', 'Risk Analysis', 'AI Modelling', 'Data Interpretation'],
      timeline: 'May 2025 – August 2025'
    },
    1: {
      title: 'AI Research Project',
      description: 'Collaborate on AI research and innovation.',
      objectives: 'Explore new AI methods and applications.',
      skills: ['Machine Learning', 'NLP', 'Python'],
      timeline: 'June 2025 – September 2025'
    },
    2: {
      title: 'University Research Collaboration',
      description: 'Join forces with interdisciplinary teams.',
      objectives: 'Enhance cross-domain research outcomes.',
      skills: ['Research Methods', 'Project Management'],
      timeline: 'May 2025 – December 2025'
    }
  };

  // Initialize all projects
  function initializeProjects() {
      allProjects = [
          ...Array.from(requestList.querySelectorAll('li')),
          ...Array.from(assignedList.querySelectorAll('li'))
      ];
  }

  // Toggle sidebar
  function toggleSidebar() {
      dashboardContainer.classList.toggle('sidebar-open');
  }

  // Search functionality
  function handleSearch(e) {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      
      if (!query) {
          allProjects.forEach(project => project.style.display = '');
          return;
      }

      allProjects.forEach(project => {
          const title = project.querySelector('h3').textContent.toLowerCase();
          const description = project.querySelector('p:not(.read-only)')?.textContent.toLowerCase() || '';
          if (title.includes(query) || description.includes(query)) {
              project.style.display = '';
          } else {
              project.style.display = 'none';
          }
      });
  }

  // Update progress
  function updateProgress() {
      const totalHandled = reviewed + (initialPending - pending);
      const percentAccepted = totalHandled > 0 ? Math.round((reviewed / totalHandled) * 100) : 0;
      const percentRejected = totalHandled > 0 ? 100 - percentAccepted : 0;

      // Update circular progress bar
      document.querySelector('.percentage').textContent = `${percentAccepted}%`;
      document.querySelector('.circle').setAttribute('stroke-dasharray', `${percentAccepted}, 100`);

      // Update counters
      reviewedCount.textContent = reviewed;
      pendingCount.textContent = pending;
      commentsCount.textContent = comments;

      // Update legend
      let legend = document.getElementById('review-legend');
      if (!legend) {
          legend = document.createElement('figcaption');
          legend.id = 'review-legend';
          document.querySelector('.progress-circle').appendChild(legend);
      }
      legend.innerHTML = `
          Accepted: <strong>${percentAccepted}%</strong><br>
          Rejected: <strong>${percentRejected}%</strong>
      `;
  }

  // Create assigned project
  function createAssignedProject(id) {
      const data = projectData[id];
      const li = document.createElement('li');
      li.innerHTML = `
          <article class="project-item">
              <section class="project-content">
                  <h3>${data.title}</h3>
                  <p class="read-only">Read-only | Comment-enabled</p>
                  <p>${data.description}</p>
                  <button class="btn btn-primary" data-project-id="${id}">View Details</button>
              </section>
          </article>
      `;
      assignedList.appendChild(li);
      allProjects.push(li); // Add to all projects array
      li.querySelector('button').addEventListener('click', () => showProjectDetails(id));
  }

  // Show project details
  function showProjectDetails(id) {
      const data = projectData[id];
      if (!data) return;

      const currentlyVisible = !viewer.hidden;
      const currentProject = titleBox.textContent;

      if (currentlyVisible && currentProject === data.title) {
          viewer.hidden = true;
          return;
      }

      titleBox.textContent = data.title;
      descBox.innerHTML = `
          <strong>Description:</strong> ${data.description}<br><br>
          <strong>Objectives:</strong> ${data.objectives}<br><br>
          <strong>Required Skills:</strong> ${data.skills.join(', ')}<br><br>
          <strong>Timeline:</strong> ${data.timeline}
      `;
      viewer.hidden = false;
      viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Event listeners
  requestList.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      
      const action = btn.dataset.action;
      const li = btn.closest('li');
      const id = li.dataset.requestId;
      if (!id) return;

      if (action === 'accept') {
          createAssignedProject(id);
          reviewed++;
      }
      pending--;
      
      // Remove from all projects array
      const index = allProjects.indexOf(li);
      if (index > -1) {
          allProjects.splice(index, 1);
      }
      
      li.remove();
      updateProgress();
  });

  submitBtn.addEventListener('click', () => {
      const comment = commentBox.value.trim();
      if (!comment) return alert('Please enter a comment.');
      comments++;
      commentBox.value = '';
      alert(`Comment submitted: ${comment}`);
      updateProgress();
  });

  sidebarToggle.addEventListener('click', toggleSidebar);
  closeSidebar.addEventListener('click', toggleSidebar);
  searchForm.addEventListener('submit', handleSearch);

  // Initialize view detail listeners
  document.querySelectorAll('button[data-project-id]').forEach(btn => {
      btn.addEventListener('click', () => showProjectDetails(btn.dataset.projectId));
  });

  // Initialize projects and progress
  initializeProjects();
  updateProgress();
});