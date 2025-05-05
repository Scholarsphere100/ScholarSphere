const { defineConfig } = require('cypress');
const path = require('path');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.test.js',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Using path.resolve to specify the exact location
      const options = {
        webpackOptions: {
          resolve: {
            alias: {
              '@js': path.resolve(__dirname, '../js'), // Make sure this is correct
            },
          },
        },
      };
      on('file:preprocessor', webpackPreprocessor(options));
    },
  },
});
