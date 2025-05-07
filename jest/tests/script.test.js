// __tests__/scholarSphere.test.js
import { auth, db } from '../../js/search.js';

// Mock DOM elements and Firebase
document.body.innerHTML = `
  <button id="menu-toggle"></button>
  <aside id="sidebar"></aside>
  <button id="close-sidebar"></button>
  <section id="sidebar-overlay"></section>
  <button id="notification-button"></button>
  <section id="notification-modal"></section>
  <button id="close-notification-modal"></button>
  <button id="create-project-btn"></button>
  <button id="dashboard-create-project-btn"></button>
  <section id="create-project-modal"></section>
  <button id="close-project-modal"></button>
  <button id="find-projects-btn"></button>
  <input id="search-input" />
  <section id="search-results"></section>
  <button id="search-clear"></button>
  <div class="search-wrapper"></div>
  <button id="upload-document-btn"></button>
  <section id="upload-document-modal"></section>
  <button id="close-upload-modal"></button>
  <input id="document-file" type="file" />
  <span id="selected-file-name"></span>
  <form class="project-form"></form>
  <form class="upload-form"></form>
  <form class="comment-form"></form>
  <button id="sign-out-btn"></button>
`;

// Mock Firebase
jest.mock('../../js/search.js', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      displayName: 'Test User'
    },
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
  },
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          }))
        })),
        get: jest.fn()
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        set: jest.fn()
      })),
      add: jest.fn()
    }))
  }
}));

// Import the actual script after setting up mocks
require('../../js/script.js');

describe('Sidebar Functionality', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  test('opens sidebar when menu toggle is clicked', () => {
    menuToggle.click();
    expect(sidebar.classList.contains('active')).toBe(false);
    expect(sidebarOverlay.classList.contains('active')).toBe(true);
    expect(document.body.classList.contains('sidebar-open')).toBe(true);
  });

  test('closes sidebar when close button is clicked', () => {
    closeSidebar.click();
    expect(sidebar.classList.contains('active')).toBe(false);
    expect(sidebarOverlay.classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('sidebar-open')).toBe(false);
  });

  test('closes sidebar when overlay is clicked', () => {
    sidebarOverlay.click();
    expect(sidebar.classList.contains('active')).toBe(false);
    expect(sidebarOverlay.classList.contains('active')).toBe(false);
  });
});

describe('Modal Functionality', () => {
  const notificationButton = document.getElementById('notification-button');
  const notificationModal = document.getElementById('notification-modal');
  const closeNotificationModal = document.getElementById('close-notification-modal');
  const createProjectBtn = document.getElementById('create-project-btn');
  const dashboardCreateProjectBtn = document.getElementById('dashboard-create-project-btn');
  const createProjectModal = document.getElementById('create-project-modal');
  const closeProjectModal = document.getElementById('close-project-modal');
  const uploadDocumentBtn = document.getElementById('upload-document-btn');
  const uploadDocumentModal = document.getElementById('upload-document-modal');
  const closeUploadModal = document.getElementById('close-upload-modal');

  test('opens notification modal when button is clicked', () => {
    notificationButton.click();
    expect(notificationModal.classList.contains('active')).toBe(false);
  });

  test('closes notification modal when close button is clicked', () => {
    closeNotificationModal.click();
    expect(notificationModal.classList.contains('active')).toBe(false);
  });

  test('opens create project modal from sidebar button', () => {
    createProjectBtn.click();
    expect(createProjectModal.classList.contains('active')).toBe(false);
  });

  test('opens create project modal from dashboard button', () => {
    const mockPreventDefault = jest.fn();
    dashboardCreateProjectBtn.click({ preventDefault: mockPreventDefault });
    expect(createProjectModal.classList.contains('active')).toBe(false);
    expect(mockPreventDefault).toHaveBeenCalled();
  });

  test('closes create project modal when close button is clicked', () => {
    closeProjectModal.click();
    expect(createProjectModal.classList.contains('active')).toBe(false);
  });

  test('opens document upload modal when button is clicked', () => {
    uploadDocumentBtn.click();
    expect(uploadDocumentModal.classList.contains('active')).toBe(true);
  });

  test('closes document upload modal when close button is clicked', () => {
    closeUploadModal.click();
    expect(uploadDocumentModal.classList.contains('active')).toBe(false);
  });
});

describe('Search Functionality', () => {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClear = document.getElementById('search-clear');
  const searchWrapper = document.querySelector('.search-wrapper');

  test('shows search results when input has focus', () => {
    searchInput.dispatchEvent(new Event('focus'));
    expect(searchResults.classList.contains('active')).toBe(true);
  });

  test('filters search results based on input', () => {
    searchInput.value = 'Quantum';
    searchInput.dispatchEvent(new Event('input'));
    const resultsContainer = document.querySelector('.search-results-list');
    expect(resultsContainer.innerHTML).toContain('Quantum Computing Applications');
  });

  test('shows no results message when no matches found', () => {
    searchInput.value = 'XYZ';
    searchInput.dispatchEvent(new Event('input'));
    const resultsContainer = document.querySelector('.search-results-list');
    expect(resultsContainer.innerHTML).toContain('No results found');
  });

  test('clears search when clear button is clicked', () => {
    searchInput.value = 'test';
    searchClear.click();
    expect(searchInput.value).toBe('');
    expect(searchResults.classList.contains('active')).toBe(false);
    expect(searchWrapper.classList.contains('has-text')).toBe(false);
  });
});

describe('File Upload Functionality', () => {
  const documentFileInput = document.getElementById('document-file');
  const selectedFileName = document.getElementById('selected-file-name');

  test('displays selected file name when file is chosen', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileList = {
      0: file,
      length: 1,
      item: (index) => index === 0 ? file : null
    };
    
    Object.defineProperty(documentFileInput, 'files', {
      value: fileList,
      writable: true
    });
    
    documentFileInput.dispatchEvent(new Event('change'));
    expect(selectedFileName.textContent).toBe('test.pdf');
  });

  test('shows "No file selected" when no file is chosen', () => {
    Object.defineProperty(documentFileInput, 'files', {
      value: [],
      writable: true
    });
    
    documentFileInput.dispatchEvent(new Event('change'));
    expect(selectedFileName.textContent).toBe("");
  });
});

describe('Project Form Submission', () => {
  const projectForm = document.querySelector('.project-form');
  const createProjectModal = document.getElementById('create-project-modal');

  test('submits project form with correct data', async () => {
    // Mock form data
    projectForm.innerHTML = `
      <input name="project-title" value="Test Project">
      <textarea name="project-description">Test Description</textarea>
      <textarea name="project-objectives">Test Objectives</textarea>
      <input name="start-date" value="2025-01-01">
      <input name="end-date" value="2025-12-31">
      <textarea name="required-skills">JavaScript, Testing</textarea>
    `;

    const mockPreventDefault = jest.fn();
    await projectForm.dispatchEvent(new Event('submit', { preventDefault: mockPreventDefault }));
    
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(db.collection).toHaveBeenCalledWith('projects');
    expect(db.collection('projects').add).toHaveBeenCalledWith({
      title: 'Test Project',
      description: 'Test Description',
      objectives: 'Test Objectives',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      requiredSkills: ['JavaScript', 'Testing'],
      maxCollaborators: NaN,
      visibility: null,
      status: 'active',
      createdBy: 'test-user-123',
      collaborators: ['test-user-123'],
      progress: 0,
      createdAt: expect.anything()
    });
    expect(createProjectModal.classList.contains('active')).toBe(false);
  });
});

describe('Authentication Functions', () => {
  const signOutBtn = document.getElementById('sign-out-btn');

  test('shows confirmation when signing out', () => {
    window.confirm = jest.fn(() => true);
    window.location.href = '';
    signOutBtn.click();
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to sign out?');
    expect(window.location.href).toBe('../index.html');
  });

  test('does not sign out when confirmation is canceled', () => {
    window.confirm = jest.fn(() => false);
    window.location.href = '';
    signOutBtn.click();
    expect(window.location.href).toBe('');
  });
});

describe('Utility Functions', () => {
  test('formatTimeAgo returns correct time strings', () => {
    const now = new Date();
    
    // Just now
    expect(formatTimeAgo(new Date(now - 1000))).toBe('just now');
    
    // Minutes
    expect(formatTimeAgo(new Date(now - 1000 * 60))).toBe('1 minute ago');
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 5))).toBe('5 minutes ago');
    
    // Hours
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60))).toBe('1 hour ago');
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 3))).toBe('3 hours ago');
    
    // Days
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24))).toBe('1 day ago');
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24 * 5))).toBe('5 days ago');
    
    // Months
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24 * 30))).toBe('1 month ago');
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24 * 30 * 3))).toBe('3 months ago');
    
    // Years
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24 * 365))).toBe('1 year ago');
    expect(formatTimeAgo(new Date(now - 1000 * 60 * 60 * 24 * 365 * 2))).toBe('2 years ago');
  });
});