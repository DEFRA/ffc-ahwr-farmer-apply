const session = require('../session')
const { whichReview } = require('../session/keys').farmerApplyData
const urlPrefix = require('../config/index').urlPrefix

module.exports = {
  method: 'GET',
  path: `${urlPrefix}/not-eligible`,
  options: {
    handler: async (request, h) => {
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `${urlPrefix}/${species}-eligibility`
      return h.view('eligibility/not-eligible', { backLink })
    }
  }
}
