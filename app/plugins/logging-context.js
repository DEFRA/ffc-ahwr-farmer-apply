import { getCustomer, getFarmerApplyData } from "../session/index.js";
import { keys } from "../session/keys.js";

// NOTE: getFarmerApplyData and getCustomer from /session
// always have to be mocked when sending test API requests
// because of this middleware. If they are not implemented, then
// the tests will return 500's and no errors will be logged

function addBindings(request) {
  const applyData = getFarmerApplyData(request);
  request.logger.setBindings({
    sbi: applyData?.organisation?.sbi,
    crn: getCustomer(request, keys.customer.crn),
    reference: applyData?.reference,
  });
}

export const loggingContextPlugin = {
  plugin: {
    name: "logging-context",
    register: (server, _) => {
      server.ext("onPreHandler", (request, h) => {
        if (
          !request.path.includes("assets") &&
          !request.path.includes("health")
        ) {
          addBindings(request);
        }

        return h.continue;
      });
    },
  },
};
