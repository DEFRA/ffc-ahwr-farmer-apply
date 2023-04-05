const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const defraIdConfig = require('../../config/index').authConfig.defraId

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest`,
    options: {
      auth: false,
      handler: async (request, h) => {
        if (defraIdConfig.enabled) {
          return h.view('defra-id/register-your-interest/register-your-interest', { ruralPaymentsAgency })
        } else {
          return h.view('register-your-interest/register-your-interest', { ruralPaymentsAgency })
        }
      }
    }
  }
]
