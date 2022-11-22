const config = require('../config')

const routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/assets'),
  require('../routes/cookies'),
  require('../routes/guidance-for-farmers'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/index'),
  require('../routes/login'),
  require('../routes/org-review'),
  require('../routes/privacy-policy'),
  require('../routes/which-review'),
  require('../routes/species-eligibility'),
  require('../routes/not-eligible'),
  require('../routes/check-answers'),
  require('../routes/declaration'),
  require('../routes/terms'),
  require('../routes/verify-login'),
  require('../routes/vet-technical')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
      if (config.registerYourInterest.enabled === true) { server.route(require('../routes/register-your-interest')) }
    }
  }
}
