const config = require('../config/index')

module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/no-business-available-to-apply-for`,
  options: {
    handler: async (request, h) => {
      return h.view('no-business-available-to-apply-for', {
        callChargesUri: config.callChargesUri,
        ruralPaymentsEmail: config.ruralPaymentsEmail
      })
    }
  }
}
