import {
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
} from "../../session/index.js";
import { config } from "../../config/index.js";
import { keys } from "../../session/keys.js";
import {
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsTimings,
  endemicsYouCanClaimMultiple,
} from "../../config/routes.js";

const { agreeSpeciesNumbers, organisation: organisationKey } =
  keys.farmerApplyData;
const urlPrefix = config.urlPrefix;

const pageUrl = `${urlPrefix}/${endemicsNumbers}`;

const agreementStatus = {
  agree: {
    value: "agree",
    text: "I agree",
  },
  notAgree: {
    value: "notAgree",
    text: "I do not agree",
  },
};

export const numbersRouteMHHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const backLink = `${urlPrefix}/${endemicsYouCanClaimMultiple}`;
        const organisation = getFarmerApplyData(request, organisationKey);

        return h.view(`${endemicsNumbers}-mh`, {
          backLink,
          agreementStatus,
          organisation,
        });
      },
      tags: ['mh']
    },
  },
  {
    method: "POST",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === "agree") {
          setFarmerApplyData(request, agreeSpeciesNumbers, "yes");
          const nextPage = `${urlPrefix}/${endemicsTimings}`;
          return h.redirect(nextPage);
        } else {
          setFarmerApplyData(request, agreeSpeciesNumbers, "no");
          clear(request);
          request.cookieAuth.clear();

          return h.view(endemicsOfferRejected, {
            termsRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency,
          });
        }
      },
    },
  },
];
