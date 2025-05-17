import { jest } from "@jest/globals";

// 🔹 Firebase App Mock
export const initializeApp = jest.fn(() => ({ fakeApp: true }));

// 🔹 Firebase Auth Mock
export const getAuth = jest.fn(() => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),   // <== here is the fix
  onAuthStateChanged: jest.fn(),
  currentUser: {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
  },
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "new-user-id" } })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "existing-user-id" } })),
}));

// 🔹 Firebase Firestore Mock (ONLY ONE DECLARATION)
export const getFirestore = jest.fn(() => ({
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((docId) => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ name: "Test User", role: "admin" }) })),
    })),
    get: jest.fn(() => Promise.resolve({
      docs: [{ id: "123", data: () => ({ name: "Test User", role: "admin" }) }],
    })),
    add: jest.fn(() => Promise.resolve({ id: "new-doc-id" })),
    orderBy: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        docs: [{ id: "456", data: () => ({ name: "Ordered User" }) }],
      })),
    })),
  })),
}));

// 🔹 Firebase Firestore Utilities Mock
export const collection = jest.fn((db, collectionName) => getFirestore().collection(collectionName));
export const doc = jest.fn((db, collectionName, docId) => getFirestore().collection(collectionName).doc(docId));
export const getDocs = jest.fn((querySnapshot) => Promise.resolve({
  docs: [{ id: "123", data: () => ({ name: "Test User", role: "admin" }) }],
}));

export const firebase = {
  initializeApp,
  auth: getAuth,
  firestore: getFirestore,
};
export const auth = getAuth(); 

export const db = {
  collection: jest.fn(() => ({
    get: jest.fn(() =>
      Promise.resolve({
        empty: true,
        forEach: () => {},
      })
    ),
  })),
};
export default firebase;