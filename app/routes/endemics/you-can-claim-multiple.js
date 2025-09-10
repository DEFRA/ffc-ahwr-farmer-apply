import { keys } from "../../session/keys.js";
import { getFarmerApplyData, setFarmerApplyData } from "../../session/index.js";
import { config } from "../../config/index.js";
import boom from "@hapi/boom";
import {
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsYouCanClaimMultiple,
} from "../../config/routes.js";
import { generateRandomID } from "../../lib/create-temp-reference.js";
import { businessAppliedBefore } from "../../api-requests/business-applied-before.js";

const { agreeMultipleSpecies, organisation: organisationKey, reference: referenceKey } = keys.farmerApplyData;
const { urlPrefix, dashboardServiceUri } = config;

const pageUrl = `${urlPrefix}/${endemicsYouCanClaimMultiple}`;
const backLink = `${dashboardServiceUri}/check-details`;
const nextPage = `${urlPrefix}/${endemicsNumbers}`;

const agreeStatusValue = "yes";
const agreementStatuses = [
  {
    value: agreeStatusValue,
    text: "I agree",
  },
  {
    value: "no",
    text: "I do not agree",
  },
];

export const claimMultipleRouteHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
         // on way in we must generate a new reference
         const tempApplicationId = generateRandomID();
         setFarmerApplyData(request, referenceKey, tempApplicationId);
 
         const organisation = getFarmerApplyData(request, organisationKey);
         if (!organisation) {
           return boom.notFound();
         }
 
         request.logger.setBindings({ sbi: organisation.sbi });
 
         const userType = await businessAppliedBefore(organisation.sbi);

         setFarmerApplyData(request, organisationKey, {
           ...organisation,
           userType,
         });
 
        return h.view(endemicsYouCanClaimMultiple, {
          backLink,
          agreementStatuses,
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
        const status = agreementStatuses.find(
          (s) => s.value === request.payload.agreementStatus,
        );

        setFarmerApplyData(request, agreeMultipleSpecies, status.value);

        if (status.value !== agreeStatusValue) {
          return h.view(endemicsOfferRejected, {
            termsRejected: true
          });
        }

        return h.redirect(nextPage);
      },
    },
  },
];
