const { eligibleSpecies, whichReview } = require('../session/keys').farmerApplyData
const session = require('../session')
const content = require('../constants/species-review-content')

module.exports = {
  method: 'GET',
  path: '/check-answers',
  options: {
    handler: async (request, h) => {
      const eligible = session.getFarmerApplyData(request, eligibleSpecies)
      if (eligible !== 'yes') {
        return h.redirect('/not-eligible')
      }
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `/${species}-eligibility`
      const rows = [
        {
          key: { text: 'Type of review' },
          value: { html: content[species].reviewType },
          actions: { items: [{ href: '/which-review', text: 'Change', visuallyHiddenText: 'change livestock' }] }
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
