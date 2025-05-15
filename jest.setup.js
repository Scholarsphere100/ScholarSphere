// jest.setup.js
import { jest } from '@jest/globals';

import { firebase } from './__mocks__/firebase.js';
// Mock sessionStorage if needed
global.sessionStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(() => '{"user": "Test User"}'),
    removeItem: jest.fn(),
  };
  
  // Mock alert if needed
  global.alert = jest.fn();

 globalThis.firebase = firebase;