/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";

import * as firebaseMocks from "../../__mocks__/firebase.js";

beforeAll(() => {
  global.firebase = {
    initializeApp: firebaseMocks.initializeApp,
    auth: firebaseMocks.getAuth,   // assign the function
    firestore: firebaseMocks.getFirestore,
  };
  
  global.auth = global.firebase.auth();  // now an object
  global.db = global.firebase.firestore();

  global.auth.signOut = jest.fn(() => Promise.resolve());  // works now
});

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

import "../../js/dashboard";

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

beforeEach(() => {
  jest.resetModules();
  sessionStorage.clear();
  document.title = "";

  global.customizeDashboard = jest.fn();
  global.setupLogout = jest.fn();

  delete window.location;
  window.location = {
    href: "/html/dashboard.html",
    pathname: "/html/dashboard.html",
  };

  // ✅ Reset DOM before tests
  document.body.innerHTML = `
    <span id="user-name"></span>
    <span id="user-email"></span>
    <img id="user-avatar" />
    <button id="logout-btn">Logout</button>
  `;
});


import { displayUserInfo } from "../../js/dashboard";

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

test("Firebase initializes correctly in dashboard.js", () => {
  expect(global.firebase.initializeApp).toHaveBeenCalled();
});

test("Handles authenticated user session in dashboard", async () => {
  global.auth.onAuthStateChanged.mockImplementation((cb) => cb(global.auth.currentUser));

  await new Promise((r) => setTimeout(r, 10)); // small wait for sessionStorage to update

  const userDataRaw = sessionStorage.getItem("user");
  expect(userDataRaw).not.toBeNull();

  const userData = JSON.parse(userDataRaw);
  expect(userData.displayName).toBe("Test User");
  expect(userData.role).toBe("admin");

  expect(global.customizeDashboard).toHaveBeenCalledWith("admin");
  expect(global.setupLogout).toHaveBeenCalled();
});


test("Updates the DOM with user information using displayUserInfo", () => {
  displayUserInfo(global.auth.currentUser);

  expect(document.getElementById("user-name").textContent).toBe("Welcome, Test User!");
  expect(document.getElementById("user-email").textContent).toBe("test@example.com");
  expect(document.getElementById("user-avatar").src).toBe('http://localhost/images/default-avatar.png');
  expect(document.title).toBe("Test User | ScholarSphere");
});

  test("Correctly sets up logout functionality", () => {
    // Ensure button exists
    const logoutBtn = document.getElementById("logout-btn");
    expect(logoutBtn).not.toBeNull();

    // Call setupLogout() explicitly to attach the event listener
    setupLogout();

    // Click the button after event listener is attached
    logoutBtn.click();

    // Validate that signOut was called
    expect(global.auth.signOut).toHaveBeenCalled();
    expect(sessionStorage.getItem("user")).toBeNull();
  });


import {initDashboard}  from '../../js/dashboard';

await Promise.resolve();
await Promise.resolve();
await Promise.resolve();

test("Redirects to login page if no authenticated user", () => {
  global.auth.onAuthStateChanged.mockImplementation((cb) => cb(null));
  
  initDashboard();

  
  expect(window.location.href).toBe("/html/login.html");
});

test("Handles missing user details gracefully in displayUserInfo", () => {
  const mockUserMissingData = {}; // No displayName, email, or photoURL

  displayUserInfo(mockUserMissingData);

  expect(document.getElementById("user-name").textContent).toBe("Welcome, User!");
  expect(document.getElementById("user-email").textContent).toBe("");
  expect(document.getElementById("user-avatar").src).toContain("http://localhost/images/default-avatar.png");
  expect(document.title).toBe("User | ScholarSphere");
});


  
  
