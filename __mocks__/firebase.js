// __mocks__/firebase.js
module.exports = {
    initializeApp: jest.fn(() => ({
      firestore: () => ({
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        update: jest.fn(),
      }),
    })),
    auth: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
    })),
    firestore: jest.fn(),
  };
  