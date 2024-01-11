const config = require("../../config");
const session = require("../../session");
const { requestAuthorizationCodeUrl } = require("../../auth");

module.exports = {
  method: "GET",
  path: `${config.urlPrefix}/endemics/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view("endemics/index", {
        defraIdLogin: requestAuthorizationCodeUrl(session, request),
        ruralPaymentsAgency: config.ruralPaymentsAgency,
      });
    },
  },
};