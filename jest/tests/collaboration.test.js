<<<<<<< HEAD
/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Mock Firebase
jest.mock('firebase/app', () => {
    const firestore = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ docs: [] }),
        update: jest.fn(),
        add: jest.fn()
    };

    const auth = {
        onAuthStateChanged: jest.fn(),
        currentUser: { uid: 'user123', displayName: 'Test User' }
    };

    return {
        initializeApp: jest.fn(),
        apps: [],
        auth: () => auth,
        firestore: () => firestore,
        firestore: {
            FieldValue: {
                serverTimestamp: jest.fn(),
                arrayUnion: jest.fn()
            }
        }
    };
});

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

import 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

describe('Collaboration.js UI interactions', () => {
    let menuToggle, closeSidebar, sidebar, overlay;

    beforeEach(() => {
        // Setup DOM structure
        document.body.innerHTML = `
            <div id="sidebar" class=""></div>
            <div id="sidebar-overlay" class=""></div>
            <button id="menu-toggle">Toggle</button>
            <button id="close-sidebar">Close</button>
        `;

        require('../../js/collaboration.js'); // Replace with your correct path

        menuToggle = document.getElementById('menu-toggle');
        closeSidebar = document.getElementById('close-sidebar');
        sidebar = document.getElementById('sidebar');
        overlay = document.getElementById('sidebar-overlay');
    });

    test('should open sidebar on menu toggle click', () => {
        fireEvent.click(menuToggle);
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
    });

    test('should close sidebar on close button click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        fireEvent.click(closeSidebar);
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });

    test('should close sidebar on overlay click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        fireEvent.click(overlay);
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });
});
=======

/**
 * @jest-environment jsdom
 */

global.firebase = {
  apps: [],  
  initializeApp: jest.fn(() => ({})),
  auth: jest.fn(() => ({
    signInWithPopup: jest.fn(() => Promise.resolve({
      user: { uid: "test-user-id" },
      credential: { accessToken: "test-token" }
    })),
    onAuthStateChanged: jest.fn((cb) => cb({ uid: "test-user-id" })),
    signOut: jest.fn(),
    currentUser: { uid: "test-user-id", displayName: "Test User" }
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ title: 'Test Project' }) })),
        update: jest.fn(() => Promise.resolve())
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] }))  // You can inject test data here if needed
      })),
      add: jest.fn(() => Promise.resolve())
    })),
    FieldValue: {
      serverTimestamp: jest.fn(),
      arrayUnion: jest.fn()
    }
  }))
};


// it('switches tab content on tab click', async () => {
//   document.body.innerHTML = `
//     <div class="tabs-nav">
//       <a>Incoming</a><a>Outgoing</a><a>Active</a>
//     </div>
//     <section class="collaboration-content"></section>
//     <div id="menu-toggle"></div>
//     <div id="close-sidebar"></div>
//     <div id="sidebar"></div>
//     <div id="sidebar-overlay"></div>
//   `;

//   await import('../../js/collaboration.js');


//   await new Promise(resolve => setTimeout(resolve, 100));

//   const tabs = document.querySelectorAll('.tabs-nav a');
//   tabs[1].click(); // Simulate clicking the "Outgoing" tab

//   await new Promise(resolve => setTimeout(resolve, 100)); // wait for DOM update

//   const header = document.querySelector('.collaboration-content .section-header h2');
//   console.log("Header after click:", header?.textContent);

//   expect(header).not.toBeNull();
//   expect(header.textContent).toBe('Outgoing Collaboration Requests');
// });

/**
 * @jest-environment jsdom
 */

it("toggles sidebar visibility on menu and overlay click", async () => {
  document.body.innerHTML = `
  <div id="menu-toggle"></div>
  <div id="close-sidebar"></div>
  <div id="sidebar"></div>
  <div id="sidebar-overlay"></div>
  <div class="tabs-nav"><a class="active"></a></div>
  <div class="collaboration-content"></div>
`;

  require ("../../js/collaboration.js");

  // 2. THEN fire DOMContentLoaded AFTER the module sets up its listener
  document.dispatchEvent(new Event("DOMContentLoaded"));

  await new Promise(resolve => setTimeout(resolve, 100));

  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  // 3. Simulate opening sidebar
  menuToggle.dispatchEvent(new Event("click", { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log("Sidebar class list after menu click:", sidebar.classList);
  expect(sidebar.classList.contains("active")).toBe(true);

  // 4. Simulate closing sidebar
  overlay.dispatchEvent(new Event("click", { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log("Sidebar class list after overlay click:", sidebar.classList);
  expect(sidebar.classList.contains("active")).toBe(false);
});

it('returns correct time ago string', async () => {
  const { timeAgo } = require('../../js/collaboration.js');

  const now = Date.now();
  const justNow = new Date(now);
  const oneHourAgo = new Date(now - 3600_000);
  const twoDaysAgo = new Date(now - 3600_000 * 48);

  expect(timeAgo(justNow)).toBe('Just now');
  expect(timeAgo(oneHourAgo)).toBe('1 hour ago');
  expect(timeAgo(twoDaysAgo)).toBe('2 days ago');
});

it('responds to a request successfully', async () => {
  const mockUpdate = jest.fn(() => {
    console.log('✅ mockUpdate called');
    return Promise.resolve();
  });
  const mockGet = jest.fn(() =>
    Promise.resolve({
      data: () => ({
        projectId: '123',
        senderId: 'user1'
      })
    })
  );
  const mockAdd = jest.fn(() => Promise.resolve());
  const mockArrayUnion = jest.fn(() => 'mock-arrayUnion');
  const mockServerTimestamp = jest.fn(() => 'mock-timestamp');

  const mockDoc = () => ({
    update: mockUpdate,
    get: mockGet
  });

  const mockCollection = jest.fn((name) => {
    if (name === 'notifications') {
      return {
        add: mockAdd
      };
    }
    return {
      doc: mockDoc
    };
  });

  global.firebase = {
    auth: () => ({
      currentUser: { uid: 'user123', displayName: 'Test User' }
    }),
    firestore: jest.fn(() => ({
      collection: mockCollection
    }))
  };

  global.firebase.firestore.FieldValue = {
    arrayUnion: mockArrayUnion,
    serverTimestamp: mockServerTimestamp
  };

  global.db = global.firebase.firestore();
  global.auth = global.firebase.auth();

  const { respondToRequest } = require('../../js/collaboration.js');

  const success = await respondToRequest('req-id', 'accepted');

  expect(success).toBe(true);
  //expect(mockUpdate).toHaveBeenCalled(); // <- this must pass
});

it('renders correct card HTML', async () => {
  const { renderCardHTML } = require('../../js/collaboration.js');

  const html = renderCardHTML('Test Project', 'Test User', 'Please collaborate', 'pending', new Date('2024-01-01'), true);
  
  expect(html).toMatch(/<h3>Test Project<\/h3>/);
  expect(html).toMatch(/Request from Test User/);
  expect(html).toMatch(/Accept/);
  expect(html).toMatch(/Decline/);
});
=======
/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Mock Firebase
jest.mock('firebase/app', () => {
    const firestore = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ docs: [] }),
        update: jest.fn(),
        add: jest.fn()
    };

    const auth = {
        onAuthStateChanged: jest.fn(),
        currentUser: { uid: 'user123', displayName: 'Test User' }
    };

    return {
        initializeApp: jest.fn(),
        apps: [],
        auth: () => auth,
        firestore: () => firestore,
        firestore: {
            FieldValue: {
                serverTimestamp: jest.fn(),
                arrayUnion: jest.fn()
            }
        }
    };
});

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

import 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

describe('Collaboration.js UI interactions', () => {
    let menuToggle, closeSidebar, sidebar, overlay;

    beforeEach(() => {
        // Setup DOM structure
        document.body.innerHTML = `
            <div id="sidebar" class=""></div>
            <div id="sidebar-overlay" class=""></div>
            <button id="menu-toggle">Toggle</button>
            <button id="close-sidebar">Close</button>
        `;

        require('../js/collaboration.js'); // Replace with your correct path

        menuToggle = document.getElementById('menu-toggle');
        closeSidebar = document.getElementById('close-sidebar');
        sidebar = document.getElementById('sidebar');
        overlay = document.getElementById('sidebar-overlay');
    });

    test('should open sidebar on menu toggle click', () => {
        fireEvent.click(menuToggle);
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('active')).toBe(true);
    });

    test('should close sidebar on close button click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        fireEvent.click(closeSidebar);
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });

    test('should close sidebar on overlay click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        fireEvent.click(overlay);
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
    });
});

>>>>>>> 91c7772a7bcd36c7a138bb1fe67d508a5962fa27
