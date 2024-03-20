const { endemicsClaimGuidance } = require('../../config/routes')
const config = require('../../config/index')
module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/${endemicsClaimGuidance}`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('endemics/guidance/claim-guidance', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
