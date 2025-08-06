import { config } from "../../config/index.js";
import { setCustomer, setFarmerApplyData } from "../../session/index.js";
import { keys } from "../../session/keys.js";
import { farmerApply } from "../../constants/constants.js";

const urlPrefix = config.urlPrefix;
const sendTo = config.dashboardServiceUri;
const pageUrl = `${urlPrefix}/endemics/dev-sign-in`;

const createDevDetails = async (sbi) => {
  const organisationSummary = {
    organisationPermission: {},
    organisation: {
      sbi,
      name: "madeUpCo",
      email: "org@company.com",
      frn: "1100918140",
      address: {
        address1: "Somewhere",
      },
    },
  };
  const personSummary = {
    email: "farmer@farm.com",
    customerReferenceNumber: "2054561445",
    firstName: "John",
    lastName: "Smith",
  };

  return [personSummary, organisationSummary];
};

function setOrganisationSessionData(
  request,
  personSummary,
  { organisation: org },
) {
  const organisation = {
    sbi: org.sbi,
    farmerName: "John Smith",
    name: org.name,
    email: personSummary.email,
    orgEmail: org.email,
    address: "Somewhere",
    crn: personSummary.customerReferenceNumber,
    frn: "1100918140",
  };
  setFarmerApplyData(request, keys.farmerApplyData.organisation, organisation);
}

export const devLoginHandlers = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      auth: false,
      handler: async (_request, h) => {
        return h.view("dev-sign-in", { backLink: "/apply/endemics/start" });
      },
    },
  },
  {
    method: "POST",
    path: pageUrl,
    options: {
      auth: false,
      handler: async (request, h) => {
        const { sbi } = request.payload;

        if (config.env === "development") {
          const [personSummary, organisationSummary] =
            await createDevDetails(sbi);
          setCustomer(request, keys.customer.id, personSummary.id);
          setCustomer(
            request,
            keys.customer.crn,
            personSummary.customerReferenceNumber,
          );
          setOrganisationSessionData(request, personSummary, organisationSummary);
          request.cookieAuth.set({ email: personSummary.email, userType: farmerApply });
        }

        return h.redirect(
          `${sendTo}/dev-sign-in?sbi=${sbi}&cameFrom=apply`,
        );
      },
    },
  },
];
