const urlPrefix = require('../config/index').urlPrefix
const defraIdConfig = require('../config').authConfig.defraId

module.exports = {
  method: 'GET',
  path: `${urlPrefix}/terms`,
  options: {
    auth: false,
    handler: async (_, h) => {
      if (defraIdConfig.enabled) {
        return h.view('defra-id/terms')
      }
      return h.view('terms')
    }
  }
}
