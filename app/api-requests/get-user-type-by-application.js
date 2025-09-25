import { applicationType, userType } from "../constants/constants.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library"

const isWithin10Months = (d) => {
  const date = new Date(d);
  const datePlus10Months = date.setMonth(date.getMonth() + 10);
  return datePlus10Months >= new Date().valueOf();
};

export function getUserTypeByApplication(latestApplicationsForSbi) {
  const oldWorldApplications = latestApplicationsForSbi.filter((application) => application.type === applicationType.VET_VISITS);
 
  if (oldWorldApplications.length === 0) {
    return userType.NEW_USER;
  }

  const latestApplication = getLatestApplication(latestApplicationsForSbi);
  const latestApplicationWithinLastTenMonths = isWithin10Months(latestApplication.data.visitDate);

  const closedStatuses = [CLAIM_STATUS.WITHDRAWN, CLAIM_STATUS.REJECTED, CLAIM_STATUS.NOT_AGREED];

  if (closedStatuses.includes(latestApplication.statusId) || !latestApplicationWithinLastTenMonths) {
    return userType.NEW_USER;
  }

  return userType.EXISTING_USER;
}

function getLatestApplication(latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
  });
}
