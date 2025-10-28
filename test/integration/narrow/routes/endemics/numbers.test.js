import * as cheerio from "cheerio";
import { ok } from "../../../../utils/phase-banner-expect";
import { getCrumbs } from "../../../../utils/get-crumbs.js";
import {
  endemicsNumbers,
  endemicsTimings,
  endemicsYouCanClaimMultiple,
} from "../../../../../app/config/routes.js";
import { getApplication, getFarmerApplyData } from '../../../../../app/session/index.js'
import { createServer } from "../../../../../app/server";
import { getLatestApplicationsBySbi } from "../../../../../app/api-requests/application-api";
import { StatusCodes } from 'http-status-codes'
import { config } from '../../../../../app/config/index.js'
import appInsights from 'applicationinsights'

const endemicsNumbersUrl = `/apply/${endemicsNumbers}`;
const endemicsYouCanClaimMultipleUrl = `/apply/${endemicsYouCanClaimMultiple}`;
const endemicsTimingsUrl = `/apply/${endemicsTimings}`;

jest.mock("../../../../../app/session", () => ({
  getFarmerApplyData: jest.fn(),
  getCustomer: jest.fn().mockResolvedValue(111111111),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
  getApplication: jest.fn(),
  setApplication: jest.fn()
}));

jest.mock("../../../../../app/api-requests/application-api");

jest.mock("applicationinsights", () => ({
  defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() },
  dispose: jest.fn(),
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
      getLatestApplicationsBySbi.mockResolvedValueOnce([]);
      const server = await createServer();
      await server.initialize();

      getFarmerApplyData.mockReturnValue(org);

      const res = await server.inject({ ...options, method: "GET" });

      expect(res.statusCode).toBe(200);

      const $ = cheerio.load(res.payload);
      const titleClassName = ".govuk-heading-l";
      const title = "Minimum number of each species in each herd or flock";
      const pageTitleByClassName = $(titleClassName).text();
      const pageTitleByName = $("title").text();
      const fullTitle = `${title} - Get funding to improve animal health and welfare`;
      const backLinkUrlByClassName = $(".govuk-back-link").attr("href");

      expect(pageTitleByName).toContain(fullTitle);
      expect(pageTitleByClassName).toEqual(title);
      expect(backLinkUrlByClassName).toContain(endemicsYouCanClaimMultipleUrl);
      ok($);

      await server.stop();
    });

    test("tracks exception and redirects user to dashboard when user has a previous new world agreement", async () => {
      getFarmerApplyData.mockReturnValue(org);
      getApplication.mockReturnValue({
        reference: 'AHWR-2470-6BA9',
        createdAt: new Date('2022-01-01'),
        statusId: 1,
        type: 'EE',
        applicationRedacts: []
      });
      const server = await createServer();
      await server.initialize();

      const res = await server.inject({ ...options, method: "GET" });

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location.toString()).toEqual(`${config.dashboardServiceUri}/vet-visits`);
      expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({ exception : new Error('User attempted to use apply journey despite already having an agreed agreement.')});
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
