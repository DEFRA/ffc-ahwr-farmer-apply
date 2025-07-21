import { config } from "../config/index.js";
import { assetsRouteHandlers } from "../routes/assets.js";
import { cookieHandlers } from "../routes/cookies.js";
import { healthHandlers } from "../routes/health.js";
import { oldWorldStartRouteHandlers } from "../routes/index.js";
import { privacyPolicyRouteHandlers } from "../routes/privacy-policy.js";
import { oldWorldEntryRouteHandlers } from "../routes/old-world-entry.js";
import { indexRouteHandlers } from "../routes/endemics/index.js";
import { numbersRouteHandlers } from "../routes/endemics/numbers.js";
import { claimMultipleRouteHandlers } from "../routes/endemics/you-can-claim-multiple.js";
import { declarationRouteHandlers } from "../routes/endemics/declaration.js";
import { checkDetailsRouteHandlers } from "../routes/endemics/check-details.js";
import { timingsRouteHandlers } from "../routes/endemics/timings.js";
import { devLoginHandlers } from "../routes/endemics/dev-sign-in.js";

export const buildRoutes = () => {
  let routes = [
    ...assetsRouteHandlers,
    ...cookieHandlers,
    ...healthHandlers,
    ...oldWorldEntryRouteHandlers,
    ...oldWorldStartRouteHandlers,
    ...privacyPolicyRouteHandlers,
    ...indexRouteHandlers,
    ...checkDetailsRouteHandlers,
    ...claimMultipleRouteHandlers,
    ...timingsRouteHandlers,
    ...declarationRouteHandlers,
    ...numbersRouteHandlers,
  ];

  if (config.devLogin.enabled) {
    routes = [...routes, ...devLoginHandlers];
  }

  return routes;
};

export const routerPlugin = {
  plugin: {
    name: "router",
    register: (server, _) => {
      server.route(buildRoutes());
    },
  },
};
