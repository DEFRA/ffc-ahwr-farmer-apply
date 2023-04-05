const session = require('../../session')
const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const defraIdConfig = require('../../config/index').authConfig.defraId

const PATH = `${urlPrefix}/register-your-interest/registration-complete`

module.exports = [
  {
    method: 'GET',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        session.clear(request)
        if (defraIdConfig.enabled) {
          return h.view(
            'defra-id/register-your-interest/registration-complete',
            {
              ruralPaymentsAgency
            }
          )
        } else {
          return h.view(
            'register-your-interest/registration-complete',
            {
              ruralPaymentsAgency
            }
          )
        }
      }
    }
  }
]
