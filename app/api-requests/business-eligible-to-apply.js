import { getLatestApplicationsBySbi } from "./application-api.js";
import { applicationType, status } from "../constants/constants.js";
import { AlreadyAppliedError } from "../exceptions/AlreadyAppliedError.js";
import { OutstandingAgreementError } from "../exceptions/OutstandingAgreementError.js";

const validStatusForApplication = [status.NOT_AGREED, status.WITHDRAWN];
const closedApplicationStatuses = [
  status.WITHDRAWN,
  status.REJECTED,
  status.NOT_AGREED,
  status.READY_TO_PAY,
];

export async function businessEligibleToApply(sbi) {
  const latestApplicationsForSbi = await getLatestApplicationsBySbi(sbi);
  if (latestApplicationsForSbi) {
    return applicationForBusinessInStateToApply(latestApplicationsForSbi);
  } else {
    throw new Error("Bad response from API");
  }
}

function applicationForBusinessInStateToApply(latestApplicationsForSbi) {
  if (latestApplicationsForSbi.length === 0) {
    return "no existing applications";
  }
  const latestApplication = latestApplicationsForSbi[0];
  if (validStatusForApplication.includes(latestApplication.statusId)) {
    return "latest application either WITHDRAWN or NOT_AGREED";
  } else {
    // this was previously else if endemics enabled, followed by other branches - endemics is on permanently now, so
    // the others could never be reached and have been removed. We could simplify this even further
    throwErrorIfApplicationCannotProceed(latestApplication);
  }
}

function throwErrorIfApplicationCannotProceed(latestApplication) {
  if (
    latestApplication.statusId === status.AGREED &&
    latestApplication.type === applicationType.ENDEMICS
  ) {
    throw new AlreadyAppliedError(
      `Business with SBI ${latestApplication.data.organisation.sbi} already has an endemics agreement`,
    );
  } else if (!closedApplicationStatuses.includes(latestApplication.statusId)) {
    // Open agreement on the old system must be closed
    throw new OutstandingAgreementError(
      `Business with SBI ${latestApplication.data.organisation.sbi} must claim or withdraw agreement before creating another.`,
    );
  }
}
