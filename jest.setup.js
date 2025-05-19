// jest.setup.js
import { jest } from '@jest/globals';

import { firebase } from './__mocks__/firebase.js';

global.db = firebase.db;
global.auth = firebase.auth;

// Still useful for legacy code accessing `firebase` globally
global.firebase = {
  ...firebase,
};
// Mock sessionStorage if needed
global.sessionStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(() => '{"user": "Test User"}'),
    removeItem: jest.fn(),
  };
  
  // Mock alert if needed
  global.alert = jest.fn();

 globalThis.firebase = firebase;