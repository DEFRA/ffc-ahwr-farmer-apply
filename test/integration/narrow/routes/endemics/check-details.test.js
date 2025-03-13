import * as cheerio from "cheerio";
import { ok } from "../../../../utils/phase-banner-expect";
import { getCrumbs } from "../../../../utils/get-crumbs.js";
import {
  endemicsCheckDetails,
  endemicsReviews,
  endemicsYouCanClaimMultiple,
} from "../../../../../app/config/routes.js";
import { businessAppliedBefore } from "../../../../../app/api-requests/business-applied-before.js";
import { requestAuthorizationCodeUrl } from "../../../../../app/auth/auth-code-grant/request-authorization-code-url.js";
import {
  getCustomer,
  getFarmerApplyData,
} from "../../../../../app/session/index.js";
import { createServer } from "../../../../../app/server";
import { config } from "../../../../../app/config";

const endemicsReviewsUrl = `/apply/${endemicsReviews}`;
const endemicsYouCanClaimMultipleUrl = `/apply/${endemicsYouCanClaimMultiple}`;

jest.mock("../../../../../app/api-requests/business-applied-before");

jest.mock(
  "../../../../../app/auth/auth-code-grant/request-authorization-code-url.js",
  () => ({
    requestAuthorizationCodeUrl: jest.fn(),
  })
);

jest.mock("../../../../../app/session", () => ({
  getCustomer: jest.fn().mockReturnValue({ crn: "123123123" }),
  getFarmerApplyData: jest.fn().mockReturnValue({
    farmerName: "Dailry Farmer",
    address: " org-address-here",
    cph: "11/222/3333",
    email: "org@test.com",
    orgEmail: "org@test.com",
    name: "org-name",
    sbi: "123456789",
  }),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
}));

describe("Org review page test", () => {
  const url = `/apply/${endemicsCheckDetails}`;
  const auth = {
    credentials: { reference: "1111", sbi: "111111111" },
    strategy: "cookie",
  };
  const org = {
    farmerName: "Dailry Farmer",
    address: " org-address-here",
    cph: "11/222/3333",
    email: "org@test.com",
    orgEmail: "org@test.com",
    name: "org-name",
    sbi: "123456789",
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe(`GET ${url} route when logged in`, () => {
    afterAll(() => {
      jest.resetAllMocks();
    });

    test("returns 200", async () => {
      businessAppliedBefore.mockReturnValue("newUser");
      const options = {
        auth,
        method: "GET",
        url,
      };

      requestAuthorizationCodeUrl.mockReturnValueOnce(
        "https://somedefraidlogin"
      );

      const res = await server.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-heading-l").text()).toEqual("Check your details");
      const keys = $(".govuk-summary-list__key");
      const values = $(".govuk-summary-list__value");
      expect(keys.eq(0).text()).toMatch("Farmer name");
      expect(values.eq(0).text()).toMatch(org.farmerName);
      expect(keys.eq(1).text()).toMatch("Business name");
      expect(values.eq(1).text()).toMatch(org.name);
      expect(keys.eq(2).text()).toMatch("SBI");
      expect(values.eq(2).text()).toMatch(org.sbi);
      expect(keys.eq(3).text()).toMatch("CRN");
      expect(values.eq(3).text()).toMatch("123123123");
      expect(keys.eq(4).text()).toMatch("Organisation email address");
      expect(values.eq(4).text()).toMatch(org.orgEmail);
      expect(keys.eq(5).text()).toMatch("User email address");
      expect(values.eq(5).text()).toMatch(org.email);
      expect(keys.eq(6).text()).toMatch("Address");
      expect(values.eq(6).text()).toMatch(org.address);
      expect($("title").text()).toContain(
        "Check your details - Get funding to improve animal health and welfare"
      );
      expect($(".govuk-back-link").attr("href")).toContain(
        "https://somedefraidlogin"
      );
      expect($("legend").text().trim()).toEqual("Are these details correct?");
      expect($(".govuk-radios__item").length).toEqual(2);
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1);
      ok($);
    });

    test("returns 404 when no orgranisation", async () => {
      getFarmerApplyData.mockReturnValue(undefined);
      const options = {
        auth,
        method: "GET",
        url,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(404);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-heading-l").text()).toEqual("404 - Not Found");
      expect($("#_404 div p").text()).toEqual("Not Found");
      ok($);
    });
  });

  describe(`POST ${url} route`, () => {
    let crumb;
    const method = "POST";

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 to next page when acceptable answer given", async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: "yes" },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(endemicsReviewsUrl);
    });

    test("navigates to same species page when multiple species is disabled", async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: "yes" },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(endemicsReviewsUrl);
    });

    test("returns 200 with update your details recognised when no is answered", async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: "no" },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-heading-l").text()).toEqual("Details are not correct");
    });

    test.each([
      { confirmCheckDetails: null },
      { confirmCheckDetails: undefined },
      { confirmCheckDetails: "wrong" },
      { confirmCheckDetails: "" },
    ])(
      "returns error when unacceptable answer is given",
      async ({ confirmCheckDetails }) => {
        getFarmerApplyData.mockReturnValue(org);
        getCustomer.mockReturnValue({ crn: "123123" });
        const options = {
          method,
          url,
          payload: { crumb, confirmCheckDetails },
          auth,
          headers: { cookie: `crumb=${crumb}` },
        };

        const res = await server.inject(options);

        expect(res.statusCode).toBe(400);
        expect(res.request.response.variety).toBe("view");
        expect(res.request.response.source.template).toBe(endemicsCheckDetails);
        expect(res.result).toContain(org.sbi);
        expect(res.result).toContain(org.farmerName);
        expect(res.result).toContain(org.address);
        expect(res.result).toContain(org.name);
      }
    );

    test("returns 400 and show error summary if user didn't select answer", async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: "" },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(400);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-error-summary .govuk-list").text().trim()).toEqual(
        "Select if these details are correct"
      );
    });
  });

  describe(`POST ${url} route - multispecies`, () => {
    let crumb;
    const method = "POST";

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("navigates to multiple species page when multiple species is enabled", async () => {
      config.multiSpecies.enabled = true;
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: "yes" },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(endemicsYouCanClaimMultipleUrl);
    });
  });
});
