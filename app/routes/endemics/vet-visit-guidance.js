const { endemicsGuidanceVetVisit } = require('../../config/routes')
const config = require('../../config/index')
module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/${endemicsGuidanceVetVisit}`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('endemics/guidance/vet-visit-guidance', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
