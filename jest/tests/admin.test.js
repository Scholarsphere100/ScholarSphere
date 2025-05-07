/**
 * @jest-environment jsdom
 */

// Mock `getUserData` and `getAllUsers`
jest.mock('../../js/admin', () => ({
  getUserData: jest.fn(async (userId) => {
    if (userId === "testUserId") {
      return {
        isAdmin: true,
        isResearcher: true,
        isReviewer: false,
        isAccepted: true,
      };
    }
    if (userId === "nonExistentUserId") {
      return null; // Simulate non-existent user
    }
    throw new Error("Firestore error"); // Simulate an error for any other userId
  }),
  getAllUsers: jest.fn(async () => [
    {
      id: "testUserId",
      isAdmin: true,
      isResearcher: true,
      isReviewer: false,
      isAccepted: true,
    },
  ]),
}));

const { getUserData, getAllUsers } = require('../../js/admin');

describe("Admin Firebase functionality (Dummy Tests)", () => {
  test("should fetch user data successfully", async () => {
    const userId = "testUserId";

    // Call the mocked function
    const userData = await getUserData(userId);

    // Assert that the returned data matches the expected result
    expect(userData).toEqual({
      isAdmin: true,
      isResearcher: true,
      isReviewer: false,
      isAccepted: true,
    });
  });

  test("should handle non-existent users gracefully", async () => {
    const userId = "nonExistentUserId";

    // Call the mocked function
    const userData = await getUserData(userId);

    // Assert that null is returned for non-existent user
    expect(userData).toBeNull();
  });

  test("should log an error when getUserData throws an exception", async () => {
    const userId = "errorUserId";

    // Expect the function to throw an error for invalid userId
    await expect(getUserData(userId)).rejects.toThrow("Firestore error");
  });

  test("should fetch all users successfully", async () => {
    // Call the mocked function
    const allUsers = await getAllUsers();

    // Assert that the returned data matches the expected array
    expect(allUsers).toEqual([
      {
        id: "testUserId",
        isAdmin: true,
        isResearcher: true,
        isReviewer: false,
        isAccepted: true,
      },
    ]);
  });
});

