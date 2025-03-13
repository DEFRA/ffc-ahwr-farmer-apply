import { getToken } from "../../session/index.js";
import { get } from "./base.js";
import { keys } from "../../session/keys.js";
import { authConfig } from "../../config/auth.js";
import { decodeJwt } from "../../auth/token-verify/jwt-decode.js";

const hostname = authConfig.ruralPaymentsAgency.hostname;

// This URL contains a hardcoded personId value (3337243) which has been confirmed by
// Version One - "We will be using a static "3337243" value as the personId parameter."
const getPersonSummaryUrl = authConfig.ruralPaymentsAgency.getPersonSummaryUrl;

export function getPersonName(personSummary) {
  return [
    personSummary.firstName,
    personSummary.middleName,
    personSummary.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function parsedAccessToken(request) {
  const accessToken = getToken(request, keys.tokens.accessToken);
  return decodeJwt(accessToken);
}

export const getPersonSummary = async (request, apimAccessToken) => {
  const crn = parsedAccessToken(request).contactId;
  const response = await get(hostname, getPersonSummaryUrl, request, {
    crn,
    Authorization: apimAccessToken,
  });
  return response._data;
};
