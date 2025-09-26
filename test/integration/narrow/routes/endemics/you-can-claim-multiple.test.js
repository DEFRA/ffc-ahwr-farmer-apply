import { getCrumbs } from "../../../../utils/get-crumbs.js";
import { endemicsNumbers, endemicsYouCanClaimMultiple } from "../../../../../app/config/routes.js";
import { getFarmerApplyData, setFarmerApplyData, setApplication, getApplication } from "../../../../../app/session/index.js";
import { createServer } from "../../../../../app/server.js";
import { config } from "../../../../../app/config/index.js";
import { StatusCodes } from "http-status-codes";

const pageUrl = `/apply/${endemicsYouCanClaimMultiple}`;
const nextPageUrl = `/apply/${endemicsNumbers}`;

jest.mock("../../../../../app/config/index.js", () => ({
  config: {
    ...jest.requireActual("../../../../../app/config/index.js").config,
    customerSurvey: {
      uri: "http://this-is-a-test-uri",
    },
    dashboardServiceUri: 'dashboard-service'
  },
}));

jest.mock("../../../../../app/session", () => ({
  getFarmerApplyData: jest.fn().mockReturnValue({
    id: "organisation",
    name: "org-name",
    address: "org-address",
    sbi: "0123456789",
    farmerName: "Mr Farm",
  }),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
  getCustomer: jest.fn().mockReturnValue(1111),
  getApplication: jest.fn(),
  setApplication: jest.fn()
}));

jest.mock("../../../../../app/api-requests/application-api", () => ({
  getLatestApplicationsBySbi: jest.fn().mockResolvedValue([])
}));

const sanitizeHTML = (html) => {
  return html
    .replace(
      /<input type="hidden" name="crumbBanner" id="crumbBanner" value=".*?"/g,
      '<input type="hidden" name="crumbBanner" id="crumbBanner" value="SANITIZED"',
    )
    .replace(
      /<input type="hidden" name="crumb" value=".*?"/g,
      '<input type="hidden" name="crumb" value="SANITIZED"',
    );
};

describe("you-can-claim-multiple page", () => {
  const optionsBase = {
    auth: {
      strategy: "cookie",
      credentials: { reference: "1111", sbi: "111111111" },
    },
    url: pageUrl,
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe("GET operation handler", () => {
    test("returns 200 and content is correct", async () => {
      const res = await server.inject({ ...optionsBase, method: "GET" });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(getFarmerApplyData).toHaveBeenCalledTimes(3); // called 2 extra times due to logging-context middleware and pre apply handler
      expect(res.payload).toContain(`${config.dashboardServiceUri}/check-details`);
      const sanitizedHTML = sanitizeHTML(res.payload);
      expect(sanitizedHTML).toMatchSnapshot();
      expect(setApplication).toHaveBeenCalled();
    });

    test("returns 500 when a new world application is already set in the session", async () => {
      getApplication.mockReturnValue({
        reference: 'AHWR-2470-6BA9',
        createdAt: new Date('2022-01-01'),
        statusId: 1,
        type: 'EE'
      });
      const res = await server.inject({ ...optionsBase, method: "GET" });

      expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(setApplication).not.toHaveBeenCalled();
    });

    test("returns 500 if there is no organisation", async () => {
      getFarmerApplyData.mockReturnValue(null)
      const res = await server.inject({ ...optionsBase, method: "GET" });

      expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    })
  });

  describe("POST operation handler", () => {
    let postOptionsBase;

    beforeEach(async () => {
      const crumb = await getCrumbs(server);
      postOptionsBase = {
        ...optionsBase,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb },
      };
    });

    test("returns 302 and navigates to correct next page when user agrees", async () => {
      const options = {
        ...postOptionsBase,
        payload: {
          ...postOptionsBase.payload,
          agreementStatus: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(setFarmerApplyData).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(nextPageUrl);
    });

    test("returns 200 and navigates to error page when user disagrees", async () => {
      const options = {
        ...postOptionsBase,
        payload: {
          ...postOptionsBase.payload,
          agreementStatus: "no",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setFarmerApplyData).toHaveBeenCalledTimes(1);
      expect(res.headers.location).not.toEqual(nextPageUrl);
    });
  });
});
