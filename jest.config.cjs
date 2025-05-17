module.exports = {
  setupFiles: ["<rootDir>/jest.setup.js", "<rootDir>/__mocks__/firebase.js"],
  testEnvironment: 'jsdom',
  //extensionsToTreatAsEsm: ['.js'],
  transform: {
     "^.+\\.js$": "babel-jest",  // Use babel-jest for transforming ES modules
  },
  testMatch: [
    '<rootDir>/jest/tests/**/*.test.js',  // Points to your custom directory
    '<rootDir>/jest/tests/**/*.spec.js'    // Optional: if you use .spec.js files
    // '<rootDir>/jest/tests/**/*.test.mjs', // ✅ Ensure .mjs files are included
    // '<rootDir>/jest/tests/**/*.spec.mjs'
  ],
  moduleNameMapper: {
  "^firebase$": "<rootDir>/__mocks__/firebase.js",
  "^firebase/(.*)$": "<rootDir>/__mocks__/firebase.js"

  },
   moduleDirectories: ["node_modules", "js"],
  moduleFileExtensions: ['js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  roots: ['<rootDir>/jest/tests']  // This helps Jest start looking from your custom directory
};