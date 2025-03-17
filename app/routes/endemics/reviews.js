import { keys } from "../../session/keys.js";
import { config } from "../../config/index.js";
import {
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
} from "../../session/index.js";
import {
  endemicsCheckDetails,
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsReviews,
} from "../../config/routes.js";

const { agreeSameSpecies, organisation: organisationKey } =
  keys.farmerApplyData;
const urlPrefix = config.urlPrefix;

const pageUrl = `${urlPrefix}/${endemicsReviews}`;
const backLink = `${urlPrefix}/${endemicsCheckDetails}`;
const nextPage = `${urlPrefix}/${endemicsNumbers}`;

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

export const reviewsRouteHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = getFarmerApplyData(request, organisationKey);
        return h.view(endemicsReviews, {
          backLink,
          agreementStatus,
          organisation,
        });
      },
    },
  },
  {
    method: "POST",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === "agree") {
          setFarmerApplyData(request, agreeSameSpecies, "yes");
          return h.redirect(nextPage);
        } else {
          setFarmerApplyData(request, agreeSameSpecies, "no");
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
