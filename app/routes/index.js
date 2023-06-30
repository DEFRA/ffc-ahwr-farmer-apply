const config = require('../config')
const session = require('../session')
const { requestAuthorizationCodeUrl } = require('../auth')

module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view('index', {
        defraIdLogin: requestAuthorizationCodeUrl(session, request),
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}
