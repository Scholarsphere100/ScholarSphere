/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

const mockUpdate = jest.fn();
const mockGet = jest.fn();

const mockDoc = jest.fn(() => ({
  update: mockUpdate,
  get: mockGet,
}));

const mockCollection = jest.fn(() => ({
  doc: mockDoc,
}));

global.firebase = {
  initializeApp: jest.fn(() => ({})),
  auth: jest.fn(() => ({})),
  firestore: jest.fn(() => ({
    collection: mockCollection,
  })),
  firestoreFieldValue: {
    serverTimestamp: jest.fn(),
  },
};

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => 'test-user-id'),
  },
  writable: true,
});

beforeAll(() => {
  delete window.location;
  window.location = { href: '' };
});

describe('selectRole.js', () => {
  beforeEach(() => {
    jest.resetModules(); // Important to reset module state for re-import
    mockGet.mockReset();
  });

  it('redirects to reviewer dashboard on valid reviewer selection', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        data: () => ({
          isPending: false,
          isAccepted: true,
          isReviewer: true,
          isResearcher: false,
        }),
      })
    );

    document.body.innerHTML = `
      <div class="role-card selected" data-role="reviewer"></div>
      <button id="continue-button">Continue</button>
    `;

    await import('../../js/selectRole.js');

    document.getElementById('continue-button').click();

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.location.href).toBe('../html/reviewer-dashboard.html');
  });

  it('redirects to researcher dashboard on valid researcher selection', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        data: () => ({
          isPending: false,
          isAccepted: true,
          isReviewer: false,
          isResearcher: true,
        }),
      })
    );

    document.body.innerHTML = `
      <div class="role-card selected" data-role="researcher"></div>
      <button id="continue-button">Continue</button>
    `;

    await import('../../js/selectRole.js');

    document.getElementById('continue-button').click();

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.location.href).toBe('../html/researcher-dashboard.html');
  });

});

