import { applicationType, userType } from "../constants/constants.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library"
import { getLatestApplication, isWithin10Months } from "../lib/utils.js";

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

