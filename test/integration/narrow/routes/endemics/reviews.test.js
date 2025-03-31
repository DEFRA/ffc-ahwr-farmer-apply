import * as cheerio from "cheerio";
import { ok } from "../../../../utils/phase-banner-expect";
import { endemicsReviews } from "../../../../../app/config/routes.js";
import { createServer } from "../../../../../app/server";
import { getCrumbs } from "../../../../utils/get-crumbs";
import { getFarmerApplyData } from "../../../../../app/session";

jest.mock("../../../../../app/session");

const endemicsNumbersUrl = "/apply/endemics/numbers";
const endemicsReviewsUrl = "/apply/endemics/reviews";
const endemicsCheckDetailsUrl = "/apply/endemics/check-details";

describe("Check review info page test", () => {
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
    url: endemicsReviewsUrl,
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe(`GET ${endemicsReviews} route when logged in`, () => {
    test("returns 200", async () => {
      getFarmerApplyData.mockReturnValue(org);

      const res = await server.inject({ ...options, method: "GET" });

      expect(res.statusCode).toBe(200);

      const $ = cheerio.load(res.payload);
      const titleClassName = ".govuk-heading-l";
      const title = "Reviews and follow-ups must be for the same species";
      const pageTitleByClassName = $(titleClassName).text();
      const pageTitleByName = $("title").text();
      const fullTitle = `${title} - Get funding to improve animal health and welfare`;
      const backLinkUrlByClassName = $(".govuk-back-link").attr("href");

      expect(pageTitleByName).toMatch(fullTitle);
      expect(pageTitleByClassName).toEqual(title);
      expect($(".govuk-heading-s").text()).toEqual(
        `${org.name} - SBI ${org.sbi}`,
      );
      expect(backLinkUrlByClassName).toContain(endemicsCheckDetailsUrl);
      ok($);
    });
  });

  describe(`POST ${endemicsReviewsUrl} route`, () => {
    let crumb;

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 to next page when agree answer given", async () => {
      const res = await server.inject({
        ...options,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: "agree" },
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(endemicsNumbersUrl);
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
