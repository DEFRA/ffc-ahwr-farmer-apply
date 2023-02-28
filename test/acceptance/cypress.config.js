const { defineConfig } = require('cypress')
module.exports = defineConfig({
  video: true,
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 100000,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',
  retries: 0,
  viewportWidth: 1200,
  viewportHeight: 700,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return require('./cypress/plugins/index')(on, config)
    },
    specPattern: 'cypress/e2e/**/**/*.feature',
  },
})
