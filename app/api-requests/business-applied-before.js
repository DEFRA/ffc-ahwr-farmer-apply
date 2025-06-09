import { getLatestApplicationsBySbi } from "./application-api.js";
import { applicationType, userType } from "../constants/constants.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library"

export async function businessAppliedBefore(sbi) {
  const latestApplicationsForSbi = await getLatestApplicationsBySbi(sbi);
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    return applicationForBusinessInStateToApply(latestApplicationsForSbi);
  } else {
    throw new Error("Bad response from API");
  }
}

const isWithin10Months = (d) => {
  const date = new Date(d);
  const datePlus10Months = date.setMonth(date.getMonth() + 10);
  return datePlus10Months >= new Date();
};

function applicationForBusinessInStateToApply(latestApplicationsForSbi) {
  if (
    latestApplicationsForSbi.filter(
      (application) => application.type === applicationType.VET_VISITS,
    ).length === 0
  ) {
    return userType.NEW_USER;
  }

  const latestApplication = getLatestApplication(latestApplicationsForSbi);

  const latestApplicationWithinLastTenMonths = isWithin10Months(
    latestApplication.data.visitDate,
  );

  if (
    [CLAIM_STATUS.WITHDRAWN, CLAIM_STATUS.REJECTED, CLAIM_STATUS.NOT_AGREED].includes(
      latestApplication.statusId,
    ) ||
    !latestApplicationWithinLastTenMonths
  ) {
    return userType.NEW_USER;
  } else {
    return userType.EXISTING_USER;
  }
}

function getLatestApplication(latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
  });
}
