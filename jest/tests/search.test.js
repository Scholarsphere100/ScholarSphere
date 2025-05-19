/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { db, auth, firebase } from '../../__mocks__/firebase.js';
import searchModule from '../../js/search';


describe('searchProjects DOM and Firestore logic', () => {
  let input, container;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="search-input" />
      <ul class="search-result"></ul>
    `;
    input = document.getElementById('search-input');
    container = document.querySelector('.search-result');

    jest.clearAllMocks();
  });

  // test('calls getAllProjects when search input is empty', async () => {
  //   input.value = ''; 
  //   jest.spyOn(searchModule, 'clearResearchItems').mockImplementation(() => {});
  //   jest.spyOn(searchModule, 'getAllProjects').mockImplementation(() => {});
  //   jest.spyOn(searchModule, 'addNewResearchItem').mockImplementation(() => {});

  //   await searchModule.searchProjects();

  //   expect(searchModule.clearResearchItems).toHaveBeenCalled();
  //   expect(searchModule.getAllProjects).toHaveBeenCalled();
  //   expect(searchModule.addNewResearchItem).not.toHaveBeenCalled();
  // });

  // test('adds a project when search term matches title', async () => {
  //   input.value = 'ai';

  //   const mockDoc = {
  //     id: 'doc1',
  //     data: () => ({
  //       title: 'AI Future',
  //       description: 'Machine learning and AI',
  //       requiredSkills: ['Python', 'ML'],
  //       startDate: '2025-05-15',
  //     }),
  //   };

  //   db.collection.mockReturnValueOnce({
  //     get: () => Promise.resolve({
  //       empty: false,
  //       forEach: callback => callback(mockDoc),
  //     }),
  //   });

  //   jest.spyOn(searchModule, 'clearResearchItems').mockImplementation(() => {});
  //   jest.spyOn(searchModule, 'addNewResearchItem').mockImplementation(() => {});

  //   await searchModule.searchProjects();

  //   expect(searchModule.clearResearchItems).toHaveBeenCalled();
  //   expect(searchModule.addNewResearchItem).toHaveBeenCalledWith(
  //     'AI Future',
  //     'Machine learning and AI',
  //     'Python, ML',
  //     '2025-05-15',
  //     'doc1'
  //   );
  // });

  test('displays message when no matches are found', async () => {
    input.value = 'blockchain';

    const mockDoc = {
      id: 'nope',
      data: () => ({
        title: 'Other Topic',
        description: 'Unrelated content',
        requiredSkills: ['C++'],
      }),
    };

    db.collection.mockReturnValueOnce({
      get: () => Promise.resolve({
        empty: false,
        forEach: callback => callback(mockDoc),
      }),
    });

    jest.spyOn(searchModule, 'clearResearchItems').mockImplementation(() => {});
    jest.spyOn(searchModule, 'addNewResearchItem').mockImplementation(() => {});

    await searchModule.searchProjects();

    const message = document.querySelector('.no-results');
    expect(message).toBeTruthy();
    expect(message.textContent).toBe('No projects found matching your search.');
    expect(searchModule.addNewResearchItem).not.toHaveBeenCalled();
  });

  // test('displays message when no projects in Firestore', async () => {
  //   input.value = 'anything';

  //   db.collection.mockReturnValueOnce({
  //     get: () => Promise.resolve({ empty: true }),
  //   });

  //   jest.spyOn(searchModule, 'clearResearchItems').mockImplementation(() => {});
  //   jest.spyOn(searchModule, 'addNewResearchItem').mockImplementation(() => {});
  //   jest.spyOn(searchModule, 'getAllProjects').mockImplementation(() => {});

  //   await searchModule.searchProjects();

  //   const message = document.querySelector('.no-results');
  //   expect(message).toBeTruthy();
  //   expect(message.textContent).toBe('No projects available.');
  //   expect(searchModule.addNewResearchItem).not.toHaveBeenCalled();
  //   expect(searchModule.getAllProjects).not.toHaveBeenCalled();
  // });

  test('gracefully handles missing input element', async () => {
    document.body.innerHTML = '<ul class="search-result"></ul>'; // No search input

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(searchModule, 'clearResearchItems').mockImplementation(() => {});
    jest.spyOn(searchModule, 'addNewResearchItem').mockImplementation(() => {});
    jest.spyOn(searchModule, 'getAllProjects').mockImplementation(() => {});

    await searchModule.searchProjects();

    expect(searchModule.clearResearchItems).not.toHaveBeenCalled();
    expect(searchModule.getAllProjects).not.toHaveBeenCalled();
    expect(searchModule.addNewResearchItem).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('Search input not found');

    errorSpy.mockRestore();
  });
});

import { addNewResearchItem, clearResearchItems, getAllProjects, sendCollaborationRequest   } from '../../js/search';

// beforeEach(() => {
//   jest.clearAllMocks();
//   global.alert = jest.fn();  
//   auth.currentUser = { uid: 'user1', displayName: 'Test User' };
// });

// test('alerts "Project not found!" when project does not exist', async () => {
//   db.collection.mockImplementation(collection => {
//     if (collection === 'projects') {
//       return {
//         doc: jest.fn(() => ({
//           get: jest.fn(() => Promise.resolve({ exists: false }))
//         }))
//       };
//     }
//     return {};
//   });

//   await sendCollaborationRequest('proj1');

//   expect(alert).toHaveBeenCalledWith('Project not found!');
// });

// test('alerts "You cannot send a request to your own project!" when user is owner', async () => {
//   db.collection.mockImplementation(collection => {
//     if (collection === 'projects') {
//       return {
//         doc: jest.fn(() => ({
//           get: jest.fn(() => Promise.resolve({
//             exists: true,
//             data: () => ({ createdBy: 'user1', title: 'My Project' })  // user is owner
//           }))
//         }))
//       };
//     }
//     return {};
//   });

//   await sendCollaborationRequest('proj1');

//   expect(alert).toHaveBeenCalledWith('You cannot send a request to your own project!');
// });

// test('alerts "You have already sent a request for this project!" when request exists', async () => {
//   db.collection.mockImplementation(collection => {
//     if (collection === 'projects') {
//       return {
//         doc: jest.fn(() => ({
//           get: jest.fn(() => Promise.resolve({
//             exists: true,
//             data: () => ({ createdBy: 'user2', title: 'Test Project' })
//           }))
//         }))
//       };
//     }

//     if (collection === 'collaborationRequests') {
//       return {
//         where: jest.fn(() => ({
//           where: jest.fn(() => ({
//             where: jest.fn(() => ({
//               get: jest.fn(() => Promise.resolve({ empty: false }))  // request exists
//             }))
//           }))
//         }))
//       };
//     }

//     return {};
//   });

//   await sendCollaborationRequest('proj1');

//   expect(alert).toHaveBeenCalledWith('You have already sent a request for this project!');
// });

// test('sends collaboration request + notification on success', async () => {
//   const mockAddCollab = jest.fn(() => Promise.resolve());
//   const mockAddNotif = jest.fn(() => Promise.resolve());

//   db.collection.mockImplementation(collection => {
//     if (collection === 'projects') {
//       return {
//         doc: jest.fn(() => ({
//           get: jest.fn(() => Promise.resolve({
//             exists: true,
//             data: () => ({ createdBy: 'user2', title: 'Test Project' })
//           }))
//         }))
//       };
//     }

//     if (collection === 'collaborationRequests') {
//       return {
//         where: jest.fn(() => ({
//           where: jest.fn(() => ({
//             where: jest.fn(() => ({
//               get: jest.fn(() => Promise.resolve({ empty: true }))
//             }))
//           }))
//         })),
//         add: mockAddCollab
//       };
//     }

//     if (collection === 'notifications') {
//       return {
//         add: mockAddNotif
//       };
//     }

//     return {};
//   });

//   await sendCollaborationRequest('proj1');

//   expect(mockAddCollab).toHaveBeenCalledWith(expect.objectContaining({
//     projectId: 'proj1',
//     projectTitle: 'Test Project',
//     senderId: 'user1',
//     senderName: 'Test User',
//     recipientId: 'user2',
//     status: 'pending',
//     createdAt: expect.any(Object)
//   }));

//   expect(mockAddNotif).toHaveBeenCalledWith(expect.objectContaining({
//     userId: 'user2',
//     type: 'collaboration',
//     message: expect.stringContaining('Test User has requested to join your project'),
//     read: false,
//     createdAt: expect.any(Object),
//     link: 'project-details.html?id=proj1'
//   }));

//   expect(alert).toHaveBeenCalledWith('Collaboration request sent successfully!');
// });

// test('alerts generic error when exception is thrown', async () => {
//   db.collection.mockImplementation(() => {
//     throw new Error('mock failure');
//   });

//   await sendCollaborationRequest('proj1');

//   expect(alert).toHaveBeenCalledWith('Error sending request. Please try again.');
// });
//jest.mock('../../js/firebase.js');

//import { getAllProjects } from '../../js/search.js';

// Mock DOM and helper
// global.addNewResearchItem = jest.fn();
// test('calls addNewResearchItem with correct data from Firestore', async () => {
//   document.body.innerHTML = '<ul class="search-result"></ul>';

//   // Spy on addNewResearchItem
//   const spy = jest.spyOn(addNewResearchItem, 'addNewResearchItem').mockImplementation(jest.fn());

//   // Mock Firestore
//   const mockDoc = {
//     id: 'mock-id',
//     data: () => ({
//       title: 'AI Project',
//       description: 'ML Research',
//       requiredSkills: ['TensorFlow', 'Python'],
//       startDate: '2025-01-01',
//     }),
//   };

//   const mockCollection = {
//     empty: false,
//     forEach: (cb) => cb(mockDoc),
//   };

//   jest.mock('../../js/firebase.js', () => ({
//     db: {
//       collection: () => ({
//         get: () => Promise.resolve(mockCollection),
//       }),
//     },
//   }));

//   // Re-import with mocked firebase (optional depending on setup)
//   const { getAllProjects } = await import('../../js/search.js');

//   await getAllProjects();

//   expect(spy).toHaveBeenCalledWith(
//     'AI Project',
//     'ML Research',
//     'TensorFlow, Python',
//     '2025-01-01',
//     'mock-id'
//   );

//   spy.mockRestore();
// });




describe('search.js DOM manipulation', () => {
  let container;

  beforeEach(() => {
    // Set up a basic DOM structure for each test
    document.body.innerHTML = `
      <ul class="search-result"></ul>
    `;
    container = document.querySelector('.search-result');
  });

  test('addNewResearchItem creates and appends a new item to the list', () => {
    addNewResearchItem(
      'AI Research',
      'Exploring AI applications.',
      'Python, ML',
      '2025-05-15',
      'project123'
    );

    const items = container.querySelectorAll('li.search-item');
    expect(items.length).toBe(1);

    const title = items[0].querySelector('h2').textContent;
    const desc = items[0].querySelector('.project-search-description').textContent;
    const skills = items[0].querySelector('.project-skills').textContent;
    const time = items[0].querySelector('time').textContent;
    const button = items[0].querySelector('button');

    expect(title).toBe('AI Research');
    expect(desc).toBe('Exploring AI applications.');
    expect(skills).toContain('Skills needed:');
    expect(skills).toContain('Python, ML');
    expect(time).toContain('Created: 2025-05-15');
    expect(button.textContent).toBe('Send Request');
    expect(button.id).toBe('project123');
  });

  test('addNewResearchItem does nothing if .search-result is not found', () => {
    // Remove the container
    document.body.innerHTML = '';

    const spy = jest.spyOn(document, 'createElement');
    addNewResearchItem('X', 'Y', 'Z', '2025-01-01', 'id123');
    expect(spy).not.toHaveBeenCalled(); // Should not even try to create elements
    spy.mockRestore();
  });

  test('creates elements with correct class names and structure', () => {
    addNewResearchItem('Title', 'Desc', 'Skills', '2025-01-01', 'id');
  
    const item = container.querySelector('li.search-item');
    expect(item).not.toBeNull();
  
    const article = item.querySelector('article.search-card');
    expect(article).not.toBeNull();
  
    expect(article.querySelector('header.project-header')).not.toBeNull();
    expect(article.querySelector('p.project-search-description')).not.toBeNull();
    expect(article.querySelector('p.project-skills')).not.toBeNull();
    expect(article.querySelector('p.project-meta')).not.toBeNull();
    expect(article.querySelector('footer.request-actions')).not.toBeNull();
  
    const button = article.querySelector('button.send-request-btn');
    expect(button).not.toBeNull();
  });

  test('time element datetime attribute is set to current date', () => {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
  
    addNewResearchItem('Title', 'Desc', 'Skills', '2025-01-01', 'id');
  
    const timeElem = container.querySelector('time');
    expect(timeElem).not.toBeNull();
    expect(timeElem.getAttribute('datetime')).toBe(todayString);
  });

  test('handles empty skills string gracefully', () => {
    addNewResearchItem('Title', 'Desc', '', '2025-01-01', 'id');
  
    const skillsText = container.querySelector('.project-skills').textContent;
    expect(skillsText).toContain('Skills needed:');
    // Should not crash or produce undefined text
    expect(skillsText).not.toContain('undefined');
  });
  

  test('multiple calls append multiple list items', () => {
    addNewResearchItem('Title1', 'Desc1', 'Skills1', '2025-01-01', 'id1');
    addNewResearchItem('Title2', 'Desc2', 'Skills2', '2025-01-02', 'id2');
  
    const items = container.querySelectorAll('li.search-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('h2').textContent).toBe('Title1');
    expect(items[1].querySelector('h2').textContent).toBe('Title2');
  });
  
  test('button has correct text content and id attribute', () => {
    addNewResearchItem('Title', 'Desc', 'Skills', '2025-01-01', 'test-id');
  
    const button = container.querySelector('button.send-request-btn');
    expect(button.textContent).toBe('Send Request');
    expect(button.id).toBe('test-id');
  });
  
  
  test('clearResearchItems removes all items from the list', () => {
    // Add some items manually
    container.innerHTML = `
      <li class="search-item">Item 1</li>
      <li class="search-item">Item 2</li>
    `;

    clearResearchItems();

    const items = container.querySelectorAll('li.search-item');
    expect(items.length).toBe(0);
    expect(container.innerHTML).toBe('');
  });

  test('clearResearchItems does nothing if .search-result is not found', () => {
    document.body.innerHTML = ''; // No .search-result

    expect(() => {
      clearResearchItems();
    }).not.toThrow();
  });
});

//import * as searchModule from '../../js/search.js'; // import all for spying
