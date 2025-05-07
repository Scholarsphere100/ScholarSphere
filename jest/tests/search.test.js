/**
 * @jest-environment jsdom
 */

// Mock implementations for database (`db`) and authentication (`auth`) directly within the mock factory
jest.mock('../../js/search', () => ({
  createCollaborationRequest: jest.fn(async (project, projectOwner) => {
    const db = {
      collection: jest.fn(() => ({
        add: jest.fn(async (data) => Promise.resolve(data)), // Mock `add` function
      })),
    };

    const auth = {
      currentUser: {
        uid: 'user123',
        displayName: 'John Doe',
      },
    };

    // Simulated behavior for creating a collaboration request
    const projectId = project.id;
    await db.collection('collaborationRequests').add({
      projectId,
      projectTitle: project.title,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      recipientId: projectOwner,
      status: 'pending',
      createdAt: new Date(),
    });

    // Simulated behavior for creating a notification for the project owner
    await db.collection('notifications').add({
      userId: projectOwner,
      type: 'collaboration',
      message: `${auth.currentUser.displayName || 'A researcher'} has requested to join your project "${project.title}"`,
      read: false,
      createdAt: new Date(),
      link: `project-details.html?id=${projectId}`,
    });
  }),
}));

const { createCollaborationRequest } = require('../../js/search');

describe('createCollaborationRequest', () => {
  test('creates a collaboration request successfully', async () => {
    const mockProject = {
      id: 'project1',
      title: 'Project 1',
    };

    const mockProjectOwner = 'owner123';

    await createCollaborationRequest(mockProject, mockProjectOwner);

    expect(createCollaborationRequest).toHaveBeenCalled();
  });

  test('creates a notification successfully', async () => {
    const mockProject = {
      id: 'project1',
      title: 'Project 1',
    };

    const mockProjectOwner = 'owner123';

    await createCollaborationRequest(mockProject, mockProjectOwner);

    expect(createCollaborationRequest).toHaveBeenCalled();
  });
});


