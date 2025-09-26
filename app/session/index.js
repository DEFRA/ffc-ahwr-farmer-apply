import { getSessionEvent } from "../event/get-session-event.js";
import { raiseEvent } from "../event/raise-event.js";

export const entries = {
  farmerApplyData: "farmerApplyData",
  customer: "customer",
  tempReference: "tempReference",
  signInRedirect: "signInRedirect",
  application: "application"
};

export function lacksAny(request, entryKey, keys) {
  let result = false;
  keys.forEach((key) => {
    if (!get(request, entryKey, key)) {
      result = true;
    }
  });
  return result;
}

function set(request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {};
  entryValue[key] = typeof value === "string" ? value.trim() : value;
  request.yar.set(entryKey, entryValue);
  const organisation = getFarmerApplyData(request, entries.organisation);
  const reference = getFarmerApplyData(request, "reference");
  const xForwardedForHeader = request.headers["x-forwarded-for"];
  const ip = xForwardedForHeader
    ? xForwardedForHeader.split(",")[0]
    : request.info.remoteAddress;
  if (organisation && reference) {
    const event = getSessionEvent(
      organisation,
      request.yar.id,
      entryKey,
      key,
      value,
      ip,
      reference,
    );
    raiseEvent(event, request.logger);
  }
}

function get(request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey);
}

export function clearApplyRedirect(request) {
  request.yar.clear(entries.signInRedirect);
}

export function setFarmerApplyData(request, key, value) {
  set(request, entries.farmerApplyData, key, value);
}

export function getFarmerApplyData(request, key) {
  return get(request, entries.farmerApplyData, key);
}

export const setCustomer = (request, key, value) => {
  set(request, entries.customer, key, value);
};

export const getCustomer = (request, key) => {
  return get(request, entries.customer, key);
};

export const setTempReference = (request, key, value) => {
  set(request, entries.tempReference, key, value);
};

export const setApplication = (request, key, value) => {
  set(request, entries.application, key, value);
};

export const getApplication = (request, key) => {
  return get(request, entries.application, key);
}

