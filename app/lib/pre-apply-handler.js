import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { getLatestApplicationsBySbi } from "../api-requests/application-api.js";
import { applicationType } from "../constants/constants.js";
import { getFarmerApplyData } from "../session/index.js";
import { keys } from "../session/keys.js";

const { organisation: organisationKey } = keys.farmerApplyData;

export const preApplyHandler = async (request, h) => {
  if (request.method === "get") {
    const organisation = getFarmerApplyData(request, organisationKey);

    request.logger.setBindings({ sbi: organisation.sbi });

    const latestApplications = await getLatestApplicationsBySbi(organisation.sbi);
    const newWorldApplications = latestApplications.filter((application) => application.type === applicationType.ENDEMICS);
    const mostRecentNewWorldApplication = newWorldApplications.length ? newWorldApplications[0] : null;

    if (mostRecentNewWorldApplication && mostRecentNewWorldApplication.statusId === CLAIM_STATUS.AGREED) {
      throw new Error("User attempted to use apply journey despite already having an agreed agreement.");
    }

    return h.continue;
  }

  return h.continue;
};
