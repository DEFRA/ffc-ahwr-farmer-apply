import { keys } from "../../session/keys.js";
import {
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
} from "../../session/index.js";
import { config } from "../../config/index.js";
import {
  endemicsCheckDetails,
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsYouCanClaimMultiple,
} from "../../config/routes.js";

const { agreeMultipleSpecies, organisation: organisationKey } =
  keys.farmerApplyData;
const urlPrefix = config.urlPrefix;

const pageUrl = `${urlPrefix}/${endemicsYouCanClaimMultiple}`;
const backLink = `${urlPrefix}/${endemicsCheckDetails}`;
const nextPage = `${urlPrefix}/${endemicsNumbers}`;

const AGREEMENT_OPTIONS = {
  YES: "yes",
  NO: "no",
};

const AGREEMENT_LABELS = {
  [AGREEMENT_OPTIONS.YES]: "I agree",
  [AGREEMENT_OPTIONS.NO]: "I do not agree",
};

const AGREEMENT_STATUSES = Object.entries(AGREEMENT_LABELS).map(([value, text]) => ({
  value,
  text,
}));

export const claimMultipleMHRouteHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = getFarmerApplyData(request, organisationKey);
        return h.view(`${endemicsYouCanClaimMultiple}-mh`, {
          backLink,
          agreementStatuses: AGREEMENT_STATUSES,
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
        const { agreementStatus } = request.payload;
        
        setFarmerApplyData(request, agreeMultipleSpecies, agreementStatus);

        if (agreementStatus !== AGREEMENT_OPTIONS.YES) {
          clear(request);
          request.cookieAuth.clear();
          return h.view(endemicsOfferRejected, {
            termsRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency,
          });
        }

        return h.redirect(nextPage);
      },
    },
  },
];
