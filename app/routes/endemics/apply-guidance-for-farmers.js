const { endemicsGuidanceForFarmers } = require('../../config/routes')
const config = require('../../config/index')
module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/${endemicsGuidanceForFarmers}`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('endemics/guidance/apply-guidance-for-farmers', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
