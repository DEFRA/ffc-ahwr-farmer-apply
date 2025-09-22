import { assetsRouteHandlers } from '../routes/assets.js'
import { cookieHandlers } from '../routes/cookies.js'
import { healthHandlers } from '../routes/health.js'
import { privacyPolicyRouteHandlers } from '../routes/privacy-policy.js'
import { numbersRouteHandlers } from '../routes/endemics/numbers.js'
import { claimMultipleRouteHandlers } from '../routes/endemics/you-can-claim-multiple.js'
import { declarationRouteHandlers } from '../routes/endemics/declaration.js'
import { timingsRouteHandlers } from '../routes/endemics/timings.js'
import { missingPagesRoutes } from '../routes/missing-routes.js'

export const buildRoutes = () => {
  return [
    ...assetsRouteHandlers,
    ...cookieHandlers,
    ...healthHandlers,
    ...privacyPolicyRouteHandlers,
    ...claimMultipleRouteHandlers,
    ...timingsRouteHandlers,
    ...declarationRouteHandlers,
    ...numbersRouteHandlers,
    ...missingPagesRoutes
  ];
};

export const routerPlugin = {
  plugin: {
    name: "router",
    register: (server, _) => {
      server.route(buildRoutes());
    },
  },
};
