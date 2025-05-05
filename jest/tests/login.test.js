/**
 * @jest-environment jsdom
 */

const mockUpdate = jest.fn(() => Promise.resolve());
const mockGet = jest.fn(() =>
  Promise.resolve({
    data: () => ({
      isPending: false,
      isAccepted: true,
      isReviewer: true,
      isResearcher: false,
      isAdmin: false, // default non-admin
    }),
  })
);

const mockDoc = jest.fn(() => ({
  update: mockUpdate,
  get: mockGet,
}));

const mockCollection = jest.fn(() => ({
  doc: mockDoc,
}));

global.firebase = {
  initializeApp: jest.fn(() => ({})),
  auth: jest.fn(() => ({
    signInWithPopup: jest.fn(() => Promise.resolve({
      user: { uid: "test-user-id" },
      credential: { accessToken: "test-token" }
    })),
    onAuthStateChanged: jest.fn((cb) => cb({ uid: "test-user-id" })),
    signOut: jest.fn(),
  })),
  firestore: jest.fn(() => ({
    collection: mockCollection,
  })),
};

global.firebase.auth.GoogleAuthProvider = function () {}; // Constructor-style mock

global.firebase.firestore.FieldValue = {
  serverTimestamp: jest.fn(() => "mock-timestamp"),
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

  jest.spyOn(window.history, 'back').mockImplementation(() => {
    window.location.href = 'previous-page';
  });
});

describe('login.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="google-login">Login with Google</button>
      <button class="auth-close-button">Close</button>
    `;
    jest.resetModules();
    mockGet.mockReset();
  });

  it('redirects to admin dashboard on valid admin user', async () => {
    // Setup admin user response
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        exists: true,
        data: () => ({
          isAdmin: true,
          name: "Lesedi Lengosane",
        }),
      })
    );

    await jest.isolateModulesAsync(async () => {
      await import('../../js/login.js');

      const googleLoginButton = document.getElementById('google-login');
      googleLoginButton.click();

      // Allow all async steps to complete
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(window.location.href).toBe('../html/admin.html');
    });
  });

  it('handles close button click event', async () => {
    await jest.isolateModulesAsync(async () => {
      await import('../../js/login.js');

      const closeButton = document.querySelector('.auth-close-button');
      closeButton.click();

      expect(window.location.href).toBe('previous-page');
    });
  });

  it('redirects to account under review page for pending users', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        exists: true,
        data: () => ({
          isAdmin: false,
          isResearcher: false,
          isReviewer: false,
          isPending: true,
          isAccepted: false,
        }),
      })
    );
  
    delete window.location;
    window.location = { href: '' };
  
    await jest.isolateModulesAsync(async () => {
      document.body.innerHTML = `
        <button id="google-login">Login with Google</button>
        <button class="auth-close-button">Close</button>
      `;
  
      await import('../../js/login.js');
  
      document.getElementById('google-login').click();
  
      // Allow microtasks to resolve (can be adjusted)
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
  
      expect(window.location.href).toBe('../html/accountUnderReview.html');
    });
  });
  
  it('redirects to rejected page for non-accepted users', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
         exists: true,
        data: () => ({
          isAdmin: false,
          isResearcher: false,
          isReviewer: false,
          isPending: false,
          isAccepted: false,
        }),
      })
    );

    delete window.location;
    window.location = { href: '' };
  
    await jest.isolateModulesAsync(async () => {
      document.body.innerHTML = `
        <button id="google-login">Login with Google</button>
        <button class="auth-close-button">Close</button>
      `;
  
      await import('../../js/login.js');
  
      document.getElementById('google-login').click();
  
      // Allow microtasks to resolve (can be adjusted)
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(window.location.href).toBe('../html/rejected.html');
    });
  });
  
  it('redirects to selectRole page if no roles assigned', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        exists: true,
        data: () => ({
          isAdmin: false,
          isResearcher: null,
          isReviewer: null,
          isPending: false,
          isAccepted: false,
        }),
      })
    );

    delete window.location;
    window.location = { href: '' };
  
    await jest.isolateModulesAsync(async () => {
      document.body.innerHTML = `
        <button id="google-login">Login with Google</button>
        <button class="auth-close-button">Close</button>
      `;

      await import('../../js/login.js');
  
      document.getElementById('google-login').click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
  
      expect(window.location.href).toBe('../html/selectRole.html');
    });
  });

  it('redirects to SignUp page if user doc does not exist', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        exists: false,
        data: () => null,
      })
    );

    delete window.location;
    window.location = { href: '' };
  
    window.alert = jest.fn(); // Mock alert so test doesn't error
  
    await jest.isolateModulesAsync(async () => {

      document.body.innerHTML = `
        <button id="google-login">Login with Google</button>
        <button class="auth-close-button">Close</button>
      `;
      await import('../../js/login.js');
  
      document.getElementById('google-login').click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
  
      expect(window.location.href).toBe('../html/SignUp.html');
      expect(window.alert).toHaveBeenCalledWith("Your account does not exist , please sign up!");
    });
  });
  
  
  
});

