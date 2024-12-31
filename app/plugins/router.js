const config = require('../config')

let routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/assets'),
  require('../routes/cookies'),
  require('../routes/guidance-for-farmers'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/index'),
  require('../routes/privacy-policy'),
  require('../routes/vet-technical'),
  require('../routes/signin-oidc')
)

if (config.endemics.enabled) {
  routes = routes.concat(
    require('../routes/endemics/index'),
    require('../routes/endemics/numbers'),
    require('../routes/endemics/you-can-claim-multiple'),
    require('../routes/endemics/reviews'),
    require('../routes/endemics/declaration'),
    require('../routes/endemics/check-details'),
    require('../routes/endemics/timings')
  )
}

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
