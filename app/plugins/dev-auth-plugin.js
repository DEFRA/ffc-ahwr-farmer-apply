import { config } from "../config/index.js";
import { getFarmerApplyData, setCustomer, setFarmerApplyData } from '../session/index.js'
import { keys } from "../session/keys.js";

const organisationKey = keys.farmerApplyData.organisation;
const crnKey = keys.customer.crn;
const idKey = keys.customer.id;

export const localDevAuthPlugin = {
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
        redirectTo: (_request) => {
          return `${config.dashboardServiceUri}/dev-defraid`;
        },
        validateFunc: async (request, _s) => {
          const result = { valid: false };

          if(!getFarmerApplyData(request, organisationKey) && request.query?.org) {
            setFarmerApplyData(request, organisationKey, JSON.parse(Buffer.from(request.query.org, "base64").toString("ascii")));
            setCustomer(request, crnKey,  request.query.crn);
            setCustomer(request, idKey, request.query.custId);
          }

          if (getFarmerApplyData(request, organisationKey)) {
            result.valid = true;
          }

          return result;
        },
      });
      server.auth.default({ strategy: "session", mode: "required" });
    },
  },
};
