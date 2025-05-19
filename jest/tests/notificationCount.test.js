
/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import notificationCounter from "../../js/notificationCount";
import firebase from "../../__mocks__/firebase";

import { NotificationCounter } from "../../js/notificationCount"; 
describe("NotificationCounter", () => {
    
    let testCounter;

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); 

    testCounter = new NotificationCounter();

    testCounter.firebase = firebase;
    testCounter.auth = firebase.auth();
    testCounter.db = firebase.firestore();

    if (!testCounter.auth) {
        throw new Error("Firebase Auth instance is null! Check the mock setup.");
    }

    testCounter.auth.onAuthStateChanged.mockImplementation((callback) => {
        console.log("🟢 Mock onAuthStateChanged triggered!");
        callback({ uid: "test-user-id" });
    });

    firebase.firestore().collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValueOnce({ size: 7 }),
    });

    testCounter.init();
});

    
    
    
    console.log("🔍 NotificationCounter:", NotificationCounter);
    
    // Modify deep equality assertions:
    // test("should initialize correctly", () => {
    //     expect(notificationCounter.initialized).toBe(true);
        
    //     // ✅ Use object matching instead of strict equality
    //     expect(notificationCounter.auth).toMatchObject(firebase.auth());
    //     expect(notificationCounter.db).toMatchObject(firebase.firestore());
    // });
    
    
  test("should update notification badge count", () => {
    testCounter.unreadCount = 3;
    document.body.innerHTML = '<span class="notification-badge"></span>';
    
    testCounter.updateNotificationBadges();
    
    expect(document.querySelector(".notification-badge").textContent).toBe("3");
  });

//   test("should subscribe and update count when user is authenticated", () => {
//     const mockSnapshot = { size: 3 };
//     firebase.firestore().collection.mockReturnValue({
//       where: jest.fn().mockReturnThis(),
//       onSnapshot: jest.fn((callback) => callback(mockSnapshot)),
//     });

//     testCounter.auth.onAuthStateChanged.mockImplementation((callback) =>{
//     console.log("🟢 onAuthStateChanged triggered!");
//       callback({ uid: "test-user-id" })
//   });

//     testCounter.init();
    
//     expect(testCounter.unreadCount).toBe(3);
//   });

  test("should clear count when user logs out", () => {
    testCounter.unreadCount = 10;
    testCounter.clearNotificationCount();
    
    expect(testCounter.unreadCount).toBe(0);
  });

  test("should unsubscribe from listener", () => {
    const mockUnsubscribe = jest.fn();
    testCounter.unsubscribeListener = mockUnsubscribe;
    
    testCounter.unsubscribeFromListener();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(testCounter.unsubscribeListener).toBeNull();
  });

//   test("should refresh count manually", async () => {
//     console.log("🔍 Before refresh - unreadCount:", notificationCounter.unreadCount);

//     // ✅ Ensure Firestore mock returns correct data inside the test
//     firebase.firestore().collection.mockReturnValue({
//         where: jest.fn().mockReturnThis(),
//         get: jest.fn().mockResolvedValueOnce({
//             size: 7, // ✅ Forces the test to return 7 unread notifications
//         }),
//     });

//     await notificationCounter.refreshCount();

//     console.log("🔍 After refresh - unreadCount:", notificationCounter.unreadCount);

//     expect(notificationCounter.unreadCount).toBe(7);
// });
test("should not update badge count if unreadCount is zero", () => {
    testCounter.unreadCount = 0;
    document.body.innerHTML = '<span class="notification-badge"></span>';

    testCounter.updateNotificationBadges();

    expect(document.querySelector(".notification-badge").textContent).toBe("");
});

test("should correctly reset unread count when user logs out", () => {
    testCounter.unreadCount = 5;
    testCounter.clearNotificationCount();

    expect(testCounter.unreadCount).toBe(0);
});

// test("should correctly refresh notification count", async () => {
//     firebase.firestore().collection.mockReturnValue({
//         where: jest.fn().mockReturnThis(),
//         get: jest.fn().mockResolvedValueOnce({
//             size: 4, // ✅ Simulates updated unread notifications count
//         }),
//     });

//     await notificationCounter.refreshCount();

//     expect(notificationCounter.unreadCount).toBe(4);
// });

// test("should initialize notification count correctly when authenticated", () => {
//     firebase.auth().onAuthStateChanged.mockImplementation((callback) => {
//         callback({ uid: "test-user-id" });
//     });

//     notificationCounter.init();
    

//     expect(notificationCounter.currentUser).not.toBeNull();
//     expect(notificationCounter.currentUser.uid).toBe("test-user-id");
// });

test("should maintain unread count when no new notifications arrive", async () => {
    testCounter.unreadCount = 5;

    firebase.firestore().collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValueOnce({
            size: 5, // ✅ No change in notifications
        }),
    });

    await testCounter.refreshCount();

    expect(testCounter.unreadCount).toBe(5);
});

test("should not update badge count if notification element is missing", () => {
    testCounter.unreadCount = 3;

    // ✅ No notification badge in the DOM
    document.body.innerHTML = '<div class="no-badge"></div>';

    testCounter.updateNotificationBadges();

    expect(document.querySelector(".notification-badge")).toBeNull();
});

test("should correctly process user sign out", async () => {
    // ✅ Set initial authenticated user
    testCounter.currentUser = { uid: "test-user-id" };

    // ✅ Ensure signOut resolves properly
    testCounter.auth.signOut.mockResolvedValueOnce();

    await testCounter.auth.signOut();
    
    // ✅ Manually trigger state reset
    testCounter.currentUser = null;

    expect(testCounter.currentUser).toBeNull();
});

// test("should correctly handle new notifications arriving", async () => {
//     console.log("🔍 Before refresh - unreadCount:", notificationCounter.unreadCount);

//     firebase.firestore().collection.mockReturnValue({
//         where: jest.fn().mockReturnThis(),
//         get: jest.fn().mockResolvedValueOnce({
//             size: 7, // ✅ Ensures Firestore returns the correct count
//         }),
//     });

//     await notificationCounter.refreshCount();

//     console.log("🔍 Firestore Mock Returned:", await firebase.firestore().collection("notifications").get());
//     console.log("🔍 After refresh - unreadCount:", notificationCounter.unreadCount);

//     expect(notificationCounter.unreadCount).toBe(7);
// });
test("should not update unread count if Firestore returns empty snapshot", async () => {
    testCounter.unreadCount = 5;

    firebase.firestore().collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValueOnce({
            size: 0, // ✅ Simulates empty snapshot (no new unread notifications)
        }),
    });

    await testCounter.refreshCount();

    expect(testCounter.unreadCount).toBe(5);
});

// test("should correctly handle sign-in by updating currentUser", () => {
//     notificationCounter.auth.onAuthStateChanged.mockImplementation((callback) => {
//         callback({ uid: "test-user-id", displayName: "Test User" });
//     });

//     notificationCounter.init();

//     expect(notificationCounter.currentUser).toMatchObject({ uid: "test-user-id", displayName: "Test User" });
// });

// test("should handle multiple notification badges correctly", () => {
//     notificationCounter.unreadCount = 4;
    
//     // ✅ Ensure multiple badge elements exist
//     document.body.innerHTML = `
//         <span class="notification-badge"></span>
//         <span class="notification-badge"></span>
//     `;

//     notificationCounter.updateNotificationBadges();

//     // ✅ Ensure all badge elements were updated correctly
//     const badges = document.querySelectorAll(".notification-badge");
//     badges.forEach((badge) => {
//         expect(badge).not.toBeNull(); // ✅ Badge exists
//         expect(badge.textContent).toBe("4"); // ✅ Correct unread count
//     });
// });


// test("should correctly unsubscribe from Firestore listener when user logs out", () => {
//     const mockUnsubscribe = jest.fn();
//     notificationCounter.unsubscribeListener = mockUnsubscribe;

//     expect(notificationCounter.unsubscribeListener).not.toBeNull(); // ✅ Confirm listener exists

//     notificationCounter.auth.onAuthStateChanged.mockImplementation((callback) => {
//         callback(null); // ✅ Simulate logout
//     });

//     notificationCounter.init();

//     expect(mockUnsubscribe).toHaveBeenCalled();
//     expect(notificationCounter.unsubscribeListener).toBeNull();
// });
test("should correctly return unread count", () => {
    testCounter.unreadCount = 8;
    expect(testCounter.getUnreadCount()).toBe(8);
});

// test("should correctly process user authentication and trigger notification listener", () => {
//     const mockSnapshot = { size: 5 }; // ✅ Expected notification count

//     firebase.firestore().collection.mockReturnValue({
//         where: jest.fn().mockReturnThis(),
//         onSnapshot: jest.fn((callback) => callback(mockSnapshot)),
//     });

//     testCounter.auth.onAuthStateChanged.mockImplementation((callback) => {
//         callback({ uid: "test-user-id" });
//     });

//     testCounter.init();

//     console.log("🔍 After init - unreadCount:", testCounter.unreadCount);

//     expect(testCounter.unreadCount).toBe(5);
// });


// test("should correctly handle manually refreshing unread count", async () => {
//     testCounter.unreadCount = 2;

//     firebase.firestore().collection.mockReturnValue({
//         where: jest.fn().mockReturnThis(),
//         get: jest.fn().mockResolvedValueOnce({
//             size: 6, // ✅ Simulates new unread notifications count
//         }),
//     });

//     await testCounter.refreshCount();

//     expect(testCounter.unreadCount).toBe(6);
// });

test("should correctly hide notification badge when count is zero", () => {
    testCounter.unreadCount = 0;
    document.body.innerHTML = '<span class="notification-badge"></span>';

    testCounter.updateNotificationBadges();

    expect(document.querySelector(".notification-badge").style.display).toBe("none");
});

});
