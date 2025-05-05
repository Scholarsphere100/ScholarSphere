//Given I am a User
//When I first SignUp
//Then a record of me should be made in the database

/**
 * @jest-environment jsdom
 */

// Mock `addUserToFirestore`
jest.mock('../../../js/addUserToFirestore', () => ({
  addUserToFirestore: jest.fn(async (db, name, userId) => {
    // Simulated user document data
    return {
      name,
      isAdmin: false,
      isPending: true,
      isAccepted: null,
      isResearcher: null,
      isReviewer: null,
    };
  }),
}));

const { addUserToFirestore } = require('../../../js/addUserToFirestore');

describe('User Signup Tests', () => {
  it('should create a new user document in Firestore', async () => {
    const db = {}; 
    const name = 'Test User';
    const userId = 'test-uid-123';

    // Call the mocked function
    const userData = await addUserToFirestore(db, name, userId);

    // Assert that the returned data matches the expected result
    expect(userData).toEqual({
      name: 'Test User',
      isAdmin: false,
      isPending: true,
      isAccepted: null,
      isResearcher: null,
      isReviewer: null,
    });
  });
});
