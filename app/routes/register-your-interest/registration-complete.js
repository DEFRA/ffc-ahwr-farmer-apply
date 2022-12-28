const session = require('../../session')
const urlPrefix = require('../../config/index').urlPrefix
const callChargesUri = require('../../config/index').callChargesUri
const ruralPaymentsEmail = require('../../config/index').ruralPaymentsEmail

const PATH = `${urlPrefix}/register-your-interest/registration-complete`

module.exports = [
  {
    method: 'GET',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        session.clear(request)
        return h.view(
          'register-your-interest/registration-complete',
          {
            callChargesUri,
            ruralPaymentsEmail
          }
        )
      }
    }
  }
]
