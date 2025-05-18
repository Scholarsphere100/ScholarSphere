import { jest } from "@jest/globals";

// 🔹 Firebase App Mock
export const initializeApp = jest.fn(() => ({ fakeApp: true }));

// 🔹 Firebase Auth Mock
export const getAuth = jest.fn(() => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()), // <== here is the fix
  onAuthStateChanged: jest.fn(),
  currentUser: {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
  },
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "new-user-id" } })
  ),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "existing-user-id" } })
  ),
}));

// 🔹 Firebase Firestore Mock (ONLY ONE DECLARATION)
export const getFirestore = jest.fn(() => ({
  collection: jest.fn((collectionName) => {
    if (collectionName === "notifications") {
      return {
        where: jest.fn().mockReturnThis(),
        get: jest.fn(() =>
          Promise.resolve({
            size: 7, // ✅ Ensures correct unread notification count
          })
        ),
      };
    }

    if (collectionName === "grants") { // ✅ Grant-related collections
      return {
        where: jest.fn().mockReturnThis(),
        get: jest.fn(() =>
          Promise.resolve({
            docs: [
              { data: () => ({ amount: "USD 5000.00" }) },
              { data: () => ({ amount: "USD 2500.00" }) },
            ],
          })
        ),
        onSnapshot: jest.fn((callback) => {
          callback({
            docs: [
              { data: () => ({ amount: "USD 5000.00" }) },
              { data: () => ({ amount: "USD 2500.00" }) },
            ],
          });
        }),
      };
    }

    if (collectionName === "chats") { // ✅ Mock chat collection for `loadChat()`
      return {
          doc: jest.fn((docId) => ({
              get: jest.fn(() =>
                  Promise.resolve({
                      exists: true, // ✅ Simulate chat exists scenario
                      data: () => ({
                          createdAt: { toDate: () => new Date("2025-05-18") }, // ✅ Simulated timestamp
                          participants: ["test-user-id", "recipient-user-id"],
                      }),
                  })
              ),
              set: jest.fn(() => Promise.resolve()), // ✅ Handles creating new chats
              update: jest.fn(() => Promise.resolve()), // ✅ Handles updating `lastUpdated` field
              collection: jest.fn((subCollectionName) => {
                  if (subCollectionName === "messages") {
                      return {
                          add: jest.fn(() => Promise.resolve({ id: "new-message-id" })), // ✅ Handles adding messages
                          orderBy: jest.fn(() => ({
                              onSnapshot: jest.fn((callback) => {
                                  callback({
                                      docChanges: () => [
                                          {
                                              type: "added",
                                              doc: {
                                                  id: "msg1",
                                                  data: () => ({
                                                      text: "Hello, world!",
                                                      senderId: "test-user-id",
                                                      timestamp: { toDate: () => new Date() },
                                                  }),
                                              },
                                          },
                                      ],
                                  });
  
                                  return jest.fn(); // ✅ Mock Unsubscribe Function
                              }),
                          })),
                      };
                  }
                  return {}; // ✅ Preserve default cases
              }),
          })),
      };
  }
  

    return { // ✅ Preserve everything else
      doc: jest.fn((docId) => ({
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            data: () => ({ name: "Test User", role: "admin" }),
          })
        ),
      })),
      get: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: "123",
              data: () => ({ name: "Test User", role: "admin" }),
            },
          ],
        })
      ),
      add: jest.fn(() => Promise.resolve({ id: "new-doc-id" })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            docs: [{ id: "456", data: () => ({ name: "Ordered User" }) }],
          })
        ),
      })),
    };
  }),
}));

// 🔹 Firebase Firestore Utilities Mock
export const collection = jest.fn((db, collectionName) =>
  getFirestore().collection(collectionName)
);
export const doc = jest.fn((db, collectionName, docId) =>
  getFirestore().collection(collectionName).doc(docId)
);
export const getDocs = jest.fn((querySnapshot) =>
  Promise.resolve({
    docs: [
      {
        id: "123",
        data: () => ({ name: "Test User", role: "admin" }),
      },
    ],
  })
);

// 🔹 Construct Firebase Mock (non-breaking extension)
export const firebase = {
  initializeApp,
  auth: getAuth,
  firestore: getFirestore,

  FieldValue: {
    serverTimestamp: jest.fn(() => new Date()), // ✅ Returns a mock timestamp
  },
  // ✅ Support firebase.apps.length and legacy-style initialization
  apps: [],
};

// ✅ Legacy-style default export that supports firebase.apps
firebase.initializeApp = initializeApp;

export const auth = getAuth();

export const db = {
  collection: jest.fn(() => ({
    get: jest.fn(() =>
      Promise.resolve({
        empty: false,
        forEach: () => {},
      })
    ),
  })),
};

export default firebase;
