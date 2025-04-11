import * as cheerio from "cheerio";
import { ok } from "../../../../utils/phase-banner-expect";
import { getCrumbs } from "../../../../utils/get-crumbs.js";
import {
  endemicsNumbers,
  endemicsTimings,
  endemicsYouCanClaimMultiple,
} from "../../../../../app/config/routes.js";
import { getFarmerApplyData } from "../../../../../app/session/index.js";
import { createServer } from "../../../../../app/server";

const endemicsNumbersUrl = `/apply/${endemicsNumbers}`;
const endemicsYouCanClaimMultipleUrl = `/apply/${endemicsYouCanClaimMultiple}`;
const endemicsTimingsUrl = `/apply/${endemicsTimings}`;

jest.mock("../../../../../app/session", () => ({
  getFarmerApplyData: jest.fn(),
  getCustomer: jest.fn().mockResolvedValue(111111111),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
}));

describe("Check review numbers page test", () => {
  const auth = {
    strategy: "cookie",
    credentials: { reference: "1111", sbi: "111111111" },
  };
  const org = {
    farmerName: "Dairy Farmer",
    address: " org-address-here",
    cph: "11/222/3333",
    email: "org@test.com",
    name: "org-name",
    sbi: "123456789",
  };
  const options = {
    auth,
    url: endemicsNumbersUrl,
  };

  describe(`GET ${endemicsNumbers} route when logged in`, () => {
    test("returns 200 and has correct backLink", async () => {
      const server = await createServer();
      await server.initialize();

      getFarmerApplyData.mockReturnValue(org);

      const res = await server.inject({ ...options, method: "GET" });

      expect(res.statusCode).toBe(200);

      const $ = cheerio.load(res.payload);
      const titleClassName = ".govuk-heading-l";
      const title = "Minimum number of livestock";
      const pageTitleByClassName = $(titleClassName).text();
      const pageTitleByName = $("title").text();
      const fullTitle = `${title} - Get funding to improve animal health and welfare`;
      const backLinkUrlByClassName = $(".govuk-back-link").attr("href");

      expect(pageTitleByName).toContain(fullTitle);
      expect(pageTitleByClassName).toEqual(title);
      expect($(".govuk-heading-s").text()).toEqual(
        `${org.name} - SBI ${org.sbi}`,
      );
      expect(backLinkUrlByClassName).toContain(endemicsYouCanClaimMultipleUrl);
      ok($);

      await server.stop();
    });
  });

  describe(`POST ${endemicsNumbersUrl} route`, () => {
    let server;
    let crumb;

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    afterAll(async () => {
      await server.stop();
    });

    beforeAll(async () => {
      server = await createServer();
      await server.initialize();
    });

    test("returns 302 to next page when agree answer given", async () => {
      const res = await server.inject({
        ...options,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: "agree" },
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(endemicsTimingsUrl);
    });

    test("returns 200 to rejected page when not agree answer given", async () => {
      const res = await server.inject({
        ...options,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: "notAgree" },
      });

      expect(res.statusCode).toBe(200);
    });
  });
});
