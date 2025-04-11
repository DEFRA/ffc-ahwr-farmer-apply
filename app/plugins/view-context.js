import { config } from "../config/index.js";

const { claimServiceUri, serviceUri, customerSurvey } =
  config;

export const viewContextPlugin = {
  plugin: {
    name: "view-context",
    register: (server, _) => {
      server.ext("onPreResponse", function (request, h) {
        const response = request.response;

        if (response.variety === "view") {
          const ctx = response.source.context || {};

          const { path } = request;

          let serviceUrl = "/apply";

          if (path.startsWith("/apply/cookies")) {
            serviceUrl = "/apply/cookies";
          }
          ctx.serviceName = "Get funding to improve animal health and welfare";
          ctx.serviceUrl = serviceUrl;
          ctx.claimServiceUri = claimServiceUri;
          ctx.serviceUri = serviceUri;
          ctx.customerSurveyUri = customerSurvey.uri;

          response.source.context = ctx;
        }

        return h.continue;
      });
    },
  },
};
