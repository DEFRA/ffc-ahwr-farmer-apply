const { urlPrefix, serviceUri } = require('../config/index')

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/terms`,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view('terms-and-conditions/private-beta-2', { continueUri: `${serviceUri}/declaration`, showContinueButton:  request.query?.continue === 'true' })
      }
    }
  },
  {
    method: 'GET',
    path: `${urlPrefix}/terms/v2`,
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('terms-and-conditions/private-beta-2', { continueUri: `${serviceUri}/declaration`, showContinueButton:  request.query?.continue === 'true' })
      }
    }
  },
  {
    method: 'GET',
    path: `${urlPrefix}/terms/v3`,
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('terms-and-conditions/private-beta-3', { continueUri: `${serviceUri}/declaration`, showContinueButton:  request.query?.continue === 'true' })
      }
    }
  }
]
