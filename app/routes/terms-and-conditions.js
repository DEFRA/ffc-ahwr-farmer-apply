const urlPrefix = require('../config/index').urlPrefix

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/terms`,
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('terms-and-conditions/private-beta-2')
      }
    }
  },
  {
    method: 'GET',
    path: `${urlPrefix}/terms/v2`,
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('terms-and-conditions/private-beta-2')
      }
    }
  },
  {
    method: 'GET',
    path: `${urlPrefix}/terms/v3`,
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('terms-and-conditions/private-beta-3')
      }
    }
  }
]
