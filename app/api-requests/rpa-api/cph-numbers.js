import { get } from "./base.js";
import { getCustomer } from "../../session/index.js";
import { keys } from "../../session/keys.js";

import { authConfig } from "../../config/auth.js";

export const getCphNumbers = async (request, apimAccessToken) => {
  const response = await get(
    authConfig.ruralPaymentsAgency.hostname,
    authConfig.ruralPaymentsAgency.getCphNumbersUrl.replace(
      "organisationId",
      getCustomer(request, keys.customer.organisationId),
    ),
    request,
    {
      crn: getCustomer(request, keys.customer.crn),
      Authorization: apimAccessToken,
    },
  );
  if (!response.success) {
    throw new Error(response.errorString);
  }
  return response.data.map((cph) => cph.cphNumber);
};
