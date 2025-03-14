import { requestAuthorizationCodeUrl } from "../../auth/auth-code-grant/request-authorization-code-url.js";
import { config } from "../../config/index.js";

export const indexRouteHandlers = [
  {
    method: "GET",
    path: `${config.urlPrefix}/endemics/start`,
    options: {
      auth: false,
      handler: async (request, h) => {
        const loginView = config.devLogin.enabled
          ? "endemics/devindex"
          : "endemics/index";
        const devLogin = config.devLogin.enabled
          ? `${config.urlPrefix}/endemics/dev-sign-in`
          : undefined;

        return h.view(loginView, {
          devLogin,
          defraIdLogin: requestAuthorizationCodeUrl(request),
          ruralPaymentsAgency: config.ruralPaymentsAgency,
        });
      },
    },
  },
];
