const config = require('../config')
const session = require('../session')
const { requestAuthorizationCodeUrl } = require('../auth')

module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      if (config.authConfig.defraId.enabled) {
        return h.view('defra-id/index', {
          defraIdLogin: requestAuthorizationCodeUrl(session, request),
          ruralPaymentsAgency: config.ruralPaymentsAgency
        })
      } else {
        return h.view('index', { ruralPaymentsAgency: config.ruralPaymentsAgency })
      }
    }
  }
}
