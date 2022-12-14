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

const registerYourInterestRoutes = [].concat(
  require('../routes/register-your-interest/register-your-interest'),
  require('../routes/register-your-interest/enter-your-crn'),
  require('../routes/register-your-interest/enter-your-sbi'),
  require('../routes/register-your-interest/enter-your-email-address'),
  require('../routes/register-your-interest/check-your-answers-and-register-your-interest'),
  require('../routes/register-your-interest/registration-complete')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
      if (config.registerYourInterest.enabled === true) {
        server.route(registerYourInterestRoutes)
      }
    }
  }
}
