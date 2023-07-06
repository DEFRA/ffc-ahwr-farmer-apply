const config = require('../config')
const session = require('../session')

module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/session-timeout`,
  options: {
    auth: false,
    handler: function (request, h) {
      session.clear(request)
      request.cookieAuth.clear()
      return h.view('session-timeout', { startLink: `${config.urlPrefix}` })
    }
  }
}
