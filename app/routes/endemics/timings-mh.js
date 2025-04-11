import {
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
} from "../../session/index.js";
import { userType } from "../../constants/constants.js";
import {
  endemicsDeclaration,
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsTimings,
} from "../../config/routes.js";
import { config } from "../../config/index.js";
import { keys } from "../../session/keys.js";

const { agreeVisitTimings, organisation: organisationKey } =
  keys.farmerApplyData;
const urlPrefix = config.urlPrefix;

const backLink = `${urlPrefix}/${endemicsNumbers}`;

export const timingsRouteMHHandlers = [
  {
    method: "GET",
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        const organisation = getFarmerApplyData(request, organisationKey);
        const hasOldWorldApplication = organisation.userType !== userType.NEW_USER;

        return h.view(`${endemicsTimings}-mh`, {
          hasOldWorldApplication,
          backLink,
          organisation,
        });
      },
      tags: ['mh']
    },
  },
  {
    method: "POST",
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === "agree") {
          setFarmerApplyData(request, agreeVisitTimings, "yes");
          return h.redirect(`${urlPrefix}/${endemicsDeclaration}`);
        }

        setFarmerApplyData(request, agreeVisitTimings, "no");
        request.cookieAuth.clear();
        clear(request);

        return h.view(endemicsOfferRejected, {
          termsRejected: true,
          ruralPaymentsAgency: config.ruralPaymentsAgency,
        });
      },
    },
  },
];
