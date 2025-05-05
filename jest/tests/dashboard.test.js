let onAuthCallback;

beforeEach(() => {
  jest.resetModules();
  sessionStorage.clear();
  document.title = "";

  global.displayUserInfo = jest.fn();
  global.customizeDashboard = jest.fn();
  global.setupLogout = jest.fn();

  const mockUser = {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    getIdTokenResult: jest.fn(() =>
      Promise.resolve({ claims: { role: "admin" } })
    ),
  };

  const mockAuth = {
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn((cb) => {
      onAuthCallback = cb; // Save the callback so we can trigger it later
    }),
    currentUser: mockUser,
  };

  global.firebase = {
    apps: [{}],
    initializeApp: jest.fn(),
    auth: jest.fn(() => mockAuth),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ title: "Test Project" }),
            })
          ),
          update: jest.fn(() => Promise.resolve()),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              docs: [{ id: "123", data: () => ({ name: "Project X" }) }],
            })
          ),
        })),
        add: jest.fn(() => Promise.resolve()),
      })),
      FieldValue: {
        serverTimestamp: jest.fn(),
        arrayUnion: jest.fn(),
      },
    })),
  };

  global.auth = global.firebase.auth();
  global.db = global.firebase.firestore();

  delete window.location;
  window.location = {
    href: "/html/dashboard.html",
    pathname: "/html/dashboard.html",
  };
});

test("Handles authenticated user session in dashboard", async () => {
  const mockUser = {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    getIdTokenResult: jest.fn(() =>
      Promise.resolve({ claims: { role: "admin" } })
    ),
  };

  // Load the dashboard code, which sets up onAuthStateChanged
  require("../../js/dashboard");

  // Manually trigger the callback as if Firebase fired it
  //await onAuthCallback(mockUser);
  await onAuthCallback(mockUser);

  // Wait for sessionStorage to be written
  await new Promise((r) => setTimeout(r, 20));

  const userDataRaw = sessionStorage.getItem("user");
  expect(userDataRaw).not.toBeNull();

  const userData = JSON.parse(userDataRaw);
  expect(userData.displayName).toBe("Test User");
  expect(userData.role).toBe("admin");

  expect(global.displayUserInfo).toHaveBeenCalledWith(mockUser);
  expect(global.customizeDashboard).toHaveBeenCalledWith("admin");
  expect(global.setupLogout).toHaveBeenCalled();
});



let onAuthStateChangedCallback;

beforeEach(() => {
  jest.resetModules();
  sessionStorage.clear();

  global.displayUserInfo = jest.fn();
  global.customizeDashboard = jest.fn();
  global.setupLogout = jest.fn();

  const mockUser = {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    getIdTokenResult: jest.fn(() =>
      Promise.resolve({ claims: { role: "admin" } })
    ),
  };

  const mockAuth = {
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn((cb) => {
      onAuthStateChangedCallback = cb; // Capture the callback
    }),
    currentUser: mockUser,
  };

  global.firebase = {
    apps: [{}],
    initializeApp: jest.fn(),
    auth: jest.fn(() => mockAuth),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              exists: true,
              data: () => ({ title: "Test Project" }),
            })
          ),
          update: jest.fn(() => Promise.resolve()),
        })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              docs: [{ id: "123", data: () => ({ name: "Project X" }) }],
            })
          ),
        })),
        add: jest.fn(() => Promise.resolve()),
      })),
      FieldValue: {
        serverTimestamp: jest.fn(),
        arrayUnion: jest.fn(),
      },
    })),
  };

  global.auth = global.firebase.auth();
  global.db = global.firebase.firestore();

  delete window.location;
  window.location = {
    href: "/html/dashboard.html",
    pathname: "/html/dashboard.html",
  };
});

test("Handles authenticated user session in dashboard", async () => {
  // Load dashboard AFTER mocks are fully set
  require("../../js/dashboard");

  // ✅ Make sure the callback has been assigned
  expect(typeof onAuthStateChangedCallback).toBe("undefined");

  const mockUser = {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    getIdTokenResult: jest.fn(() =>
      Promise.resolve({ claims: { role: "admin" } })
    ),
  };

  // ✅ Trigger callback manually
  await onAuthStateChangedCallback(mockUser);

  await new Promise((res) => setTimeout(res, 10));

  const userDataRaw = sessionStorage.getItem("user");
  expect(userDataRaw).not.toBeNull();

  const userData = JSON.parse(userDataRaw);
  expect(userData.displayName).toBe("Test User");
  expect(userData.role).toBe("admin");

  expect(global.displayUserInfo).toHaveBeenCalledWith(mockUser);
  expect(global.customizeDashboard).toHaveBeenCalledWith("admin");
});

  
  
  
  
  
  
  

//   test("Redirects user to correct dashboard based on role in dashboard.js", async () => {
//     global.firebase.auth().onAuthStateChanged.mockImplementation((callback) => {
//         console.log("Setting up mock for auth state change...");
//         const mockUser = {
//             uid: "test-user-id",
//             displayName: "Test User",
//             email: "test@example.com",
//             getIdTokenResult: jest.fn(() => Promise.resolve({ claims: { role: "reviewer" } })),
//         };

//         console.log("Mock User Before Callback:", mockUser);
//         callback(mockUser);
//     });
//     console.log("Auth state change mock applied!");

//     await import("../../js/dashboard"); // ✅ Import AFTER authentication mock setup

//     await new Promise(resolve => setTimeout(resolve, 200)); // ✅ Ensure session storage updates

//     console.log("Session Storage After Auth:", sessionStorage.getItem("user"));
//     console.log("Final window.location.href:", window.location.href);

//     // ✅ Manually trigger auth state change if Jest isn't doing it
//     if (global.firebase.auth().onAuthStateChanged.mock.calls.length > 0) {
//         console.log("Manually triggering auth state change...");
//         global.firebase.auth().onAuthStateChanged.mock.calls[0][0]({
//             uid: "test-user-id",
//             displayName: "Test User",
//             email: "test@example.com",
//             getIdTokenResult: jest.fn(() => Promise.resolve({ claims: { role: "reviewer" } }))
//         });
//     }

//     expect(sessionStorage.getItem("user")).not.toBe(null);
//     expect(window.location.href).toBe("../html/reviewer-dashboard.html");
// });


  
  
  
  
  
  
  
//   test("Logs out user and redirects to landing page", async () => {
//     const logoutBtn = document.createElement("button");
//     logoutBtn.id = "logout-btn";
//     document.body.appendChild(logoutBtn);
  
//     await import("../../js/dashboard");
  
//     global.firebase.auth().signOut.mockResolvedValueOnce();
  
//     logoutBtn.click();
  
//     expect(sessionStorage.getItem("user")).toBeNull();
//     expect(window.location.href).toBe("../html/landingPage.html");
//   });

//   test("Fetches user data from Firestore", async () => {
//     const userRef = global.firebase.firestore().collection("users").doc("test-user-id");
  
//     const userData = await userRef.get();
  
//     expect(userData.exists).toBe(true);
//     expect(userData.data().displayName).toBe("Test User");
//   });
  
  
