const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsLoginUri = require('../../config/index').ruralPaymentsLoginUri
const callChargesUri = require('../../config/index').callChargesUri
const ruralPaymentsEmail = require('../../config/index').ruralPaymentsEmail

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest`,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view('register-your-interest/register-your-interest', { ruralPaymentsLoginUri, callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
