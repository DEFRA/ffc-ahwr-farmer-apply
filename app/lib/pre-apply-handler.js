import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { getLatestApplicationsBySbi } from "../api-requests/application-api.js";
import { applicationType } from "../constants/constants.js";
import { getApplication, getFarmerApplyData, setApplication } from "../session/index.js";
import { keys } from "../session/keys.js";
import { getLatestApplication } from "./utils.js";

const { farmerApplyData: { organisation: organisationKey }, application: applicationKey } = keys;

export const preApplyHandler = async (request, h) => {
  if (request.method === "get") {
    const organisation = getFarmerApplyData(request, organisationKey);
    let application = getApplication(request, applicationKey);

    if (!application) {
      const latestApplications = await getLatestApplicationsBySbi(organisation.sbi);
      const newWorldApplications = latestApplications.filter((application) => application.type === applicationType.ENDEMICS);
      application = newWorldApplications.length ? getLatestApplication(newWorldApplications) : null;
      setApplication(request, applicationKey, application);
    }

    request.logger.setBindings({ sbi: organisation.sbi });

    if (application?.statusId === CLAIM_STATUS.AGREED) {
      throw new Error("User attempted to use apply journey despite already having an agreed agreement.");
    }
  }

  return h.continue;
};
