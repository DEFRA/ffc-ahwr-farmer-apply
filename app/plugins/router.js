import { config } from '../config/index.js'
import { accessibilityRouteHandlers } from '../routes/accessibility.js'
import { assetsRouteHandlers } from '../routes/assets.js'
import { cookieHandlers } from '../routes/cookies.js'
import { healthHandlers } from '../routes/health.js'
import { oldWorldStartRouteHandlers } from '../routes/index.js'
import { privacyPolicyRouteHandlers } from '../routes/privacy-policy.js'
import { signinRouteHandlers } from '../routes/signin-oidc.js'
import { oldWorldEntryRouteHandlers } from '../routes/old-world-entry.js'
import { indexRouteHandlers } from '../routes/endemics/index.js'
import { numbersRouteHandlers } from '../routes/endemics/numbers.js'
import { claimMultipleRouteHandlers } from '../routes/endemics/you-can-claim-multiple.js'
import { reviewsRouteHandlers } from '../routes/endemics/reviews.js'
import { declarationRouteHandlers } from '../routes/endemics/declaration.js'
import { checkDetailsRouteHandlers } from '../routes/endemics/check-details.js'
import { timingsRouteHandlers } from '../routes/endemics/timings.js'

let routes = [
  ...accessibilityRouteHandlers,
  ...assetsRouteHandlers,
  ...cookieHandlers,
  ...healthHandlers,
  ...oldWorldEntryRouteHandlers,
  ...oldWorldStartRouteHandlers,
  ...privacyPolicyRouteHandlers,
  ...signinRouteHandlers
]

if (config.endemics.enabled) {
  routes = routes.concat(
    ...indexRouteHandlers,
    ...numbersRouteHandlers,
    ...claimMultipleRouteHandlers,
    ...reviewsRouteHandlers,
    ...declarationRouteHandlers,
    ...checkDetailsRouteHandlers,
    ...timingsRouteHandlers
  )
}

export const routerPlugin = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
