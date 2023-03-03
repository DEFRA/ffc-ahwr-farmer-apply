const { defineConfig } = require('cypress')
const cucumber = require("cypress-cucumber-preprocessor").default
const URL = require('dotenv').config({ path: `./test/acceptance/.env${process.env.E2E_ENV}` })

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
      on("file:preprocessor", cucumber())
      config.baseUrl = URL.parsed.URL
      config.env.NAME = process.env.NAME
      return config
    },
    specPattern: 'test/acceptance/cypress/e2e/**/**/*.feature',
    supportFile: false
  },
})