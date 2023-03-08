const config = require('../config')
const session = require('../session')
const { getAuthenticationUrl } = require('../auth')
module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      if (config.defraId.enabled) {
        return h.view('defra-id/index', {
          defraIdLogin: getAuthenticationUrl(session, request)
        })
      } else {
        return h.view('index')
      }
    }
  }
}
