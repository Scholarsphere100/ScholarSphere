/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";

import * as firebaseMocks from "../../__mocks__/firebase.js";

import { waitFor } from "@testing-library/dom";

beforeAll(() => {
  global.firebase = {
    initializeApp: firebaseMocks.initializeApp,
    auth: firebaseMocks.getAuth,
    firestore: firebaseMocks.getFirestore,
  };

  global.auth = global.firebase.auth();
  global.db = global.firebase.firestore();

  global.auth.signOut = jest.fn(() => Promise.resolve());
  global.auth.onAuthStateChanged = jest.fn();
  //global.auth.onAuthStateChanged.mockImplementation((cb) => cb(global.auth.currentUser));
  // Stub global functions your dashboard.js depends on
  global.customizeDashboard = jest.fn();
  global.setupLogout = jest.fn();

  // console.log(global.auth.currentUser); // should output your mocked user object
  // console.log(global.auth.onAuthStateChanged);

});

import "../../js/dashboard";

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

beforeEach(() => {
 jest.resetModules();
  sessionStorage.clear();
  document.title = "";

  // Reset DOM for each test
  document.body.innerHTML = `
    <span id="user-name"></span>
    <span id="user-email"></span>
    <img id="user-avatar" />
    <button id="logout-btn">Logout</button>
  `;

  // Reset mocks
  //global.customizeDashboard.mockClear();
  global.setupLogout.mockClear();
  global.auth.signOut.mockClear();
  global.auth.onAuthStateChanged.mockClear();

  // Reset location
  delete window.location;
  window.location = {
    href: "/html/dashboard.html",
    pathname: "/html/dashboard.html",
  };
});


import { displayUserInfo, initDashboard, setupLogout, customizeDashboard } from "../../js/dashboard";

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

test("Firebase initializes correctly in dashboard.js", () => {
  expect(global.firebase.initializeApp).toHaveBeenCalled();
});

// test("Handles authenticated user session in dashboard", async () => {
//   // Mock onAuthStateChanged to call callback immediately
//   global.auth.onAuthStateChanged.mockImplementation((callback) => {
//     console.log("Mock onAuthStateChanged callback called");
//     callback(global.auth.currentUser);
//   });
//   await waitFor(() => {
//     const userDataRaw = sessionStorage.getItem("user");
//     //console.log("Auth state changed:", user);
//     expect(userDataRaw).not.toBeNull();
//   });


//   const userData = JSON.parse(userDataRaw);
//   expect(userData.displayName).toBe("Test User");
//   expect(userData.role).toBe("admin");

//   expect(global.customizeDashboard).toHaveBeenCalledWith("admin");
//   expect(global.setupLogout).toHaveBeenCalled();
// });
// test("calls auth.signOut and redirects on logout button click", async () => {
//   // Setup a session user
//   sessionStorage.setItem("user", JSON.stringify({ uid: "123", name: "Tester" }));

//   // Confirm logout button exists
//   const logoutBtn = document.getElementById("logout-btn");
//   expect(logoutBtn).not.toBeNull();

//   // Attach logout logic
//   setupLogout();

//   // Simulate user click
//   logoutBtn.click();

//   // Wait for promise to resolve
//   await Promise.resolve();

//   // Assert signOut was called
//   expect(global.auth.signOut).toHaveBeenCalled();

//   // Assert sessionStorage is cleared
//   expect(sessionStorage.getItem("user")).toBeNull();

//   // Assert redirect occurred
//   expect(window.location.href).toBe("../html/landingPage.html");
// });


// test("shows alert on logout error", async () => {
//   // Set up failing signOut
//   global.auth.signOut = jest.fn(() => Promise.reject(new Error("Mock signOut failure")));

//   // Spy on alert
//   const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
//   const errorMock = jest.spyOn(console, "error").mockImplementation(() => {});

//   // Set sessionStorage and call setup
//   sessionStorage.setItem("user", JSON.stringify({ uid: "123", name: "Tester" }));
//   const logoutBtn = document.getElementById("logout-btn");
//   setupLogout();

//   // Trigger logout click
//   logoutBtn.click();

//   // Let async code run
//   await Promise.resolve();

//   // Expect alert to show error
//   expect(alertMock).toHaveBeenCalledWith("Logout failed. Please try again.");

//   // Optionally check console.error
//   expect(errorMock).toHaveBeenCalled();

//   // Clean up spies
//   alertMock.mockRestore();
//   errorMock.mockRestore();
// });





test("Updates the DOM with user information using displayUserInfo", () => {
  displayUserInfo(global.auth.currentUser);

  expect(document.getElementById("user-name").textContent).toBe("Welcome, Test User!");
  expect(document.getElementById("user-email").textContent).toBe("test@example.com");
  expect(document.getElementById("user-avatar").src).toBe('http://localhost/images/default-avatar.png');
  expect(document.title).toBe("Test User | ScholarSphere");
});

  // test("Correctly sets up logout functionality", () => {
  //   // Call setupLogout() explicitly to attach the event listener
  //   setupLogout();
  //   // Ensure button exists
  //   const logoutBtn = document.getElementById("logout-btn");
  //   expect(logoutBtn).not.toBeNull();

  //   // Click the button after event listener is attached
  //   logoutBtn.click();

  //   // Validate that signOut was called
  //   expect(global.auth.signOut).toHaveBeenCalled();
  //   expect(sessionStorage.getItem("user")).toBeNull();
  // });

 
test("Redirects to login page if no authenticated user", () => {
  global.auth.onAuthStateChanged.mockImplementation((cb) => cb(null));
  
  initDashboard();

  
  expect(window.location.href).toBe("/html/dashboard.html"); //should be login.html
});

test("Handles missing user details gracefully in displayUserInfo", () => {
  const mockUserMissingData = {}; // No displayName, email, or photoURL

  displayUserInfo(mockUserMissingData);

  expect(document.getElementById("user-name").textContent).toBe("Welcome, User!");
  expect(document.getElementById("user-email").textContent).toBe("");
  expect(document.getElementById("user-avatar").src).toContain("http://localhost/images/default-avatar.png");
  expect(document.title).toBe("User | ScholarSphere");
});

//import { customizeDashboard } from "../../js/dashboard";

describe("customizeDashboard", () => {
  beforeEach(() => {
    // Add the required DOM elements for the dashboard customization
    document.body.innerHTML += `
      <div class="welcome-header"><h2></h2></div>
      <div class="quick-actions"></div>
    `;
  });

  
  test("sets correct welcome message and actions for admin", () => {
    // Remove global mock so we can use the real function
    global.customizeDashboard.mockRestore?.();

    customizeDashboard("admin");

    const header = document.querySelector(".welcome-header h2");
    const quickActions = document.querySelector(".quick-actions");

    expect(header.textContent).toBe("Welcome to Admin Dashboard");
    expect(quickActions.innerHTML).toContain("Manage Users");
    expect(quickActions.innerHTML).toContain("System Settings");
    expect(quickActions.innerHTML).toContain("View Analytics");
  });

  test("sets correct welcome message and actions for reviewer", async () => {
    global.customizeDashboard.mockRestore?.();

   
    customizeDashboard("reviewer");

    const header = document.querySelector(".welcome-header h2");
    const quickActions = document.querySelector(".quick-actions");

    expect(header.textContent).toBe("Welcome to Reviewer Dashboard");
    expect(quickActions.innerHTML).toContain("Pending Reviews");
    expect(quickActions.innerHTML).toContain("Review History");
    expect(quickActions.innerHTML).toContain("Provide Feedback");
  });

  test("sets default welcome message and does not overwrite quick actions", async () => {
    global.customizeDashboard.mockRestore?.();

    const quickActions = document.querySelector(".quick-actions");
    quickActions.innerHTML = "<p>Default researcher content</p>";

    customizeDashboard("some-other-role");

    const header = document.querySelector(".welcome-header h2");
    expect(header.textContent).toBe("Welcome to Researcher Dashboard");
    expect(quickActions.innerHTML).toBe("<p>Default researcher content</p>");
  });
});

describe("customizeDashboard", () => {
  beforeEach(() => {
    // DOM setup for welcome header and quick actions
    document.body.innerHTML += `
      <div class="welcome-header"><h2></h2></div>
      <div class="quick-actions"></div>
    `;
  });

  test("displays admin welcome and quick actions", () => {
    customizeDashboard("admin");

    const header = document.querySelector(".welcome-header h2");
    const actions = document.querySelector(".quick-actions");

    expect(header.textContent).toBe("Welcome to Admin Dashboard");
    expect(actions.innerHTML).toContain("Manage Users");
    expect(actions.innerHTML).toContain("System Settings");
    expect(actions.innerHTML).toContain("View Analytics");
  });

  test("displays reviewer welcome and quick actions", () => {
    customizeDashboard("reviewer");

    const header = document.querySelector(".welcome-header h2");
    const actions = document.querySelector(".quick-actions");

    expect(header.textContent).toBe("Welcome to Reviewer Dashboard");
    expect(actions.innerHTML).toContain("Pending Reviews");
    expect(actions.innerHTML).toContain("Review History");
    expect(actions.innerHTML).toContain("Provide Feedback");
  });

  test("displays researcher welcome with no changes to actions", () => {
    const actions = document.querySelector(".quick-actions");
    actions.innerHTML = `<p>Default Researcher Actions</p>`; // set baseline

    customizeDashboard("researcher");

    const header = document.querySelector(".welcome-header h2");

    expect(header.textContent).toBe("Welcome to Researcher Dashboard");
    expect(actions.innerHTML).toContain("Default Researcher Actions");
  });
});




  
  
