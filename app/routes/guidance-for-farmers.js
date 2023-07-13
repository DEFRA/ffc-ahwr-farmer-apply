const config = require('../config/index')
module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/landing-page')
    }
  }
},
{
  method: 'GET',
  path: `${config.urlPrefix}/guidance-for-farmers`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/apply-guidance-for-farmers', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
},
{
  method: 'GET',
  path: `${config.urlPrefix}/claim-guidance-for-farmers`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/claim-guidance-for-farmers', {
        claimServiceUri: config.claimServiceUri,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        dateOfTestingEnabled: config.dateOfTesting.enabled
      })
    }
  }
},
{
  method: 'GET',
  path: `${config.urlPrefix}/guidance-for-vet`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/guidance-for-vet', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
