import { requestAuthorizationCodeUrl } from "../../auth/auth-code-grant/request-authorization-code-url.js";
import { config } from "../../config/index.js";
import { keys } from "../../session/keys.js";
import { setFarmerApplyData } from "../../session/index.js";

export const indexRouteHandlers = [
  {
    method: "GET",
    path: `${config.urlPrefix}/endemics/start`,
    options: {
      auth: false,
      handler: async (request, h) => {
        // prevents previous session's reference being used when returning to the service
        setFarmerApplyData(request, keys.farmerApplyData.reference, null);

        const { loginView, devLogin } = config.devLogin.enabled ?
          {
            loginView: "endemics/devindex",
            devLogin: `${config.urlPrefix}/endemics/dev-sign-in`,
          } :
          {
            loginView: "endemics/index"
          };

        const defraIdLogin = config.devLogin.enabled && config.env === 'development' ?
          `${config.dashboardServiceUri}/dev-defraid` :
          requestAuthorizationCodeUrl(request);

        return h.view(loginView, {
          devLogin,
          defraIdLogin,
          ruralPaymentsAgency: config.ruralPaymentsAgency,
        });
      },
    },
  },
];
