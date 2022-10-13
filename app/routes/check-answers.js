const { eligibleSpecies, whichReview } = require('../session/keys').farmerApplyData
const session = require('../session')
const content = require('../constants/species-review-content')
const urlPrefix = require('../config/index').urlPrefix

module.exports = {
  method: 'GET',
  path: `${urlPrefix}/check-answers`,
  options: {
    handler: async (request, h) => {
      const eligible = session.getFarmerApplyData(request, eligibleSpecies)
      if (eligible !== 'yes') {
        return h.redirect(`${urlPrefix}/not-eligible`)
      }
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `${urlPrefix}/${species}-eligibility`
      const rows = [
        {
          key: { text: 'Type of review' },
          value: { html: content[species].reviewType },
          actions: { items: [{ href: `${urlPrefix}/which-review`, text: 'Change', visuallyHiddenText: 'change livestock' }] }
        },
        {
          key: { text: 'Number of livestock' },
          value: { html: content[species].liveStockNumber },
          actions: { items: [{ href: backLink, text: 'Change', visuallyHiddenText: 'change livestock' }] }
        }
      ]

      return h.view('check-answers', { listData: { rows }, backLink })
    }
  }
}
