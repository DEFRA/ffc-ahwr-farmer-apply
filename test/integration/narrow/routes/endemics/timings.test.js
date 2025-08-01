import * as cheerio from "cheerio";
import { endemicsDeclaration } from "../../../../../app/config/routes.js";
import { createServer } from "../../../../../app/server.js";
import { getCrumbs } from "../../../../utils/get-crumbs.js";
import { getFarmerApplyData } from "../../../../../app/session/index.js";
const auth = {
  credentials: { reference: "1111", sbi: "111111111" },
  strategy: "cookie",
};
const url = "/apply/endemics/timings";

jest.mock("../../../../../app/session/index.js", () => ({
  getFarmerApplyData: jest.fn(),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
  getCustomer: jest.fn().mockReturnValue(1111),
}));

jest.mock("applicationinsights", () => ({
  defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() },
  dispose: jest.fn(),
}));

describe("Declaration test", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe(`GET ${url} route`, () => {

    test("returns 200 when application found and multi herds is enabled", async () => {
      getFarmerApplyData.mockReturnValue({
        name: "org-name",
        sbi: "0123456789",
        userType: "newUser",
      });
      const options = {
        method: "GET",
        url,
        auth,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(200);
      const $ = cheerio.load(res.payload);
      expect($("h1").text()).toMatch("Timing of reviews and follow-ups");
      expect($("title").text()).toMatch(
        "Timing of reviews and follow-ups - Get funding to improve animal health and welfare",
      );
      expect($("h3").text()).toEqual("org-name - SBI 0123456789");

      expect($("main h2").length).toBe(2);

      const firstListItems = $('ul.govuk-list--bullet').first().find('li');

      const expectedItems = [
        'have an Improve Animal Health and Welfare (IAHW) agreement in place before you do your first review, including any sampling or testing',
        'ensure reviews on herds or flocks of a particular species, are at least 10 months apart',
        'have no more than 3 reviews on any number of herds or flocks per species by 19 June 2027'
      ];

      const actualItems = firstListItems.map((i, el) => $(el).text().trim()).get();

      expect(actualItems).toEqual(expectedItems);
    });
  });

  describe("POST timings route", () => {
    let crumb;

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 to next page when agree answer given", async () => {
      const res = await server.inject({
        url,
        auth,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: "agree" },
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(`/apply/${endemicsDeclaration}`);
    });

    test("returns 200 to agreement rejected page when rejected answer given", async () => {
      const res = await server.inject({
        url,
        auth,
        method: "POST",
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: "rejected" },
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
