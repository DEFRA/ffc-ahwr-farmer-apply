import { config } from "../config/index.js";

export const oldWorldEntryRouteHandlers = [
  {
    method: "GET",
    path: `${config.urlPrefix}`,
    options: {
      auth: false,
      handler: async (_, h) => {
        // This is the landing page for old world prior to starting journey,redirect to new world start point
        return h.redirect(`${config.urlPrefix}/endemics/start`);
      },
    },
  },
];
