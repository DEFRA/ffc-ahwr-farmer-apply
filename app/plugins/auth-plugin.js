import { config } from "../config/index.js";
import { getFarmerApplyData } from "../session/index.js";
import { keys } from "../session/keys.js";
import { requestAuthorizationCodeUrl } from "../auth/auth-code-grant/request-authorization-code-url.js";

const organisationKey = keys.farmerApplyData.organisation;

export const authPlugin = {
  plugin: {
    name: "auth",
    register: async (server, _) => {
      server.auth.strategy("session", "cookie", {
        cookie: {
          isSameSite: config.cookie.isSameSite,
          isSecure: config.cookie.isSecure,
          name: config.cookie.cookieNameAuth,
          password: config.cookie.password,
          path: config.cookiePolicy.path,
          ttl: config.cookie.ttl,
        },
        keepAlive: true,
        redirectTo: (request) => {
          return requestAuthorizationCodeUrl(request);
        },
        validateFunc: async (request) => {
          return { valid: Boolean(getFarmerApplyData(request, organisationKey)) }
        },
      });
      server.auth.default({ strategy: "session", mode: "required" });
    },
  },
};
