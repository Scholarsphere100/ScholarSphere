module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/jest/tests/**/*.test.js',  // Points to your custom directory
    '<rootDir>/jest/tests/**/*.spec.js'    // Optional: if you use .spec.js files
  ],
  moduleFileExtensions: ['js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  roots: ['<rootDir>/jest/tests']  // This helps Jest start looking from your custom directory
};