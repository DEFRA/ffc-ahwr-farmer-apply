import { getCrumbs } from "../../../../utils/get-crumbs.js";
import {
  endemicsCheckDetails,
  endemicsNumbers,
  endemicsYouCanClaimMultiple,
} from "../../../../../app/config/routes.js";
import {
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
} from "../../../../../app/session/index.js";
import { createServer } from "../../../../../app/server.js";
import { config } from "../../../../../app/config/index.js";

const pageUrl = `/apply/${endemicsYouCanClaimMultiple}`;
const backLinkUrl = `/apply/${endemicsCheckDetails}`;
const nextPageUrl = `/apply/${endemicsNumbers}`;

jest.mock("../../../../../app/config/index.js", () => ({
  config: {
    ...jest.requireActual("../../../../../app/config/index.js").config,
    customerSurvey: {
      uri: "http://this-is-a-test-uri",
    },
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
      config.multiHerds.enabled = false;

      const res = await server.inject({ ...optionsBase, method: "GET" });

      expect(res.statusCode).toBe(200);
      expect(getFarmerApplyData).toHaveBeenCalledTimes(2); // called an extra time due to logging-context middleware
      expect(res.payload).toContain(backLinkUrl);
      const sanitizedHTML = sanitizeHTML(res.payload);
      expect(sanitizedHTML).toMatchSnapshot();
    });

    test("returns 200 and content is correct when multi herds is enabled", async () => {
      config.multiHerds.enabled = true;
      const res = await server.inject({ ...optionsBase, method: "GET" });

      expect(res.statusCode).toBe(200);
      expect(getFarmerApplyData).toHaveBeenCalledTimes(2); // called an extra time due to logging-context middleware
      expect(res.payload).toContain(backLinkUrl);
      const sanitizedHTML = sanitizeHTML(res.payload);
      expect(sanitizedHTML).toMatchSnapshot();
    });
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

      expect(res.statusCode).toBe(302);
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

      expect(res.statusCode).toBe(200);
      expect(setFarmerApplyData).toHaveBeenCalledTimes(1);
      expect(clear).toHaveBeenCalledTimes(1);
      expect(res.headers.location).not.toEqual(nextPageUrl);
    });
  });
});
