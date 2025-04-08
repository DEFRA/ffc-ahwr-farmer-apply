import joi from "joi";
import boom from "@hapi/boom";
import { config } from "../../config/index.js";
import { getFarmerApplyData, setFarmerApplyData } from "../../session/index.js";
import { businessAppliedBefore } from "../../api-requests/business-applied-before.js";
import { keys } from "../../session/keys.js";
import { getOrganisation } from "../models/organisation.js";
import { generateRandomID } from "../../lib/create-temp-reference.js";
import {
  endemicsCheckDetails,
  endemicsDetailsNotCorrect,
  endemicsYouCanClaimMultiple,
} from "../../config/routes.js";

const {
  organisation: organisationKey,
  confirmCheckDetails: confirmCheckDetailsKey,
  reference: referenceKey,
} = keys.farmerApplyData;

const pageUrl = `${config.urlPrefix}/${endemicsCheckDetails}`;
const errorMessageText = "Select if these details are correct";

export const checkDetailsRouteHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      handler: async (request, h) => {
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

        return h.view(
          endemicsCheckDetails,
          getOrganisation(request, organisation),
        );
      },
    },
  },
  {
    method: "POST",
    path: pageUrl,
    options: {
      validate: {
        payload: joi.object({
          confirmCheckDetails: joi.string().valid("yes", "no").required(),
        }),
        failAction: (request, h, _err) => {
          const organisation = getFarmerApplyData(request, organisationKey);
          if (!organisation) {
            return boom.notFound();
          }
          return h
            .view(endemicsCheckDetails, {
              errorMessage: { text: errorMessageText },
              ...getOrganisation(request, organisation, errorMessageText),
            })
            .code(400)
            .takeover();
        },
      },
      handler: async (request, h) => {
        const tempApplicationId = generateRandomID();
        setFarmerApplyData(request, referenceKey, tempApplicationId);

        const { confirmCheckDetails } = request.payload;
        setFarmerApplyData(
          request,
          confirmCheckDetailsKey,
          confirmCheckDetails,
        );

        if (confirmCheckDetails === "yes") {
          return h.redirect(`${config.urlPrefix}/${endemicsYouCanClaimMultiple}`);
        }

        return h.view(endemicsDetailsNotCorrect, {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          title: "Details are not correct"
        });
      },
    },
  },
];
