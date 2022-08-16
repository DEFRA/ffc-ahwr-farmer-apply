const session = require('../session')
const { whichReview } = require('../session/keys').farmerApplyData

module.exports = {
  method: 'GET',
  path: '/not-eligible',
  options: {
    handler: async (request, h) => {
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `/${species}-eligibility`
      return h.view('eligibility/not-eligible', { backLink })
    }
  }
}
