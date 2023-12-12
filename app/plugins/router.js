const config = require('../config')

let routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/assets'),
  require('../routes/cookies'),
  require('../routes/guidance-for-farmers'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/index'),
  require('../routes/org-review'),
  require('../routes/privacy-policy'),
  require('../routes/which-review'),
  require('../routes/species-eligibility'),
  require('../routes/not-eligible'),
  require('../routes/check-answers'),
  require('../routes/declaration'),
  require('../routes/terms-and-conditions'),
  require('../routes/vet-technical'),
  require('../routes/signin-oidc')
)

if(config.endemics.enabled){
  routes.concat(
    require('../routes/endemics/declaration'),
    require('../routes/endemics/check-your-eligible')
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
