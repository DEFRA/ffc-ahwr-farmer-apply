import { createServer } from "../../../../../app/server.js";
import { config } from "../../../../../app/config/index.js";
import * as cheerio from "cheerio";
import { ok } from "../../../../utils/phase-banner-expect.js";
import { getCrumbs } from "../../../../utils/get-crumbs.js";
import { businessEligibleToApply } from "../../../../../app/api-requests/business-eligible-to-apply.js";
import { AlreadyAppliedError } from "../../../../../app/exceptions/AlreadyAppliedError.js";

jest.mock("../../../../../app/session/index");
jest.mock("../../../../../app/api-requests/business-eligible-to-apply");

describe("Dev sign in page test", () => {
  let server;

  beforeAll(async () => {
    config.devLogin.enabled = true;
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    config.devLogin.enabled = false;
  });

  test("GET dev login route returns 200 when not logged in", async () => {
    const options = {
      method: "GET",
      url: "/apply/endemics/dev-sign-in",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(200);
    const $ = cheerio.load(res.payload);
    expect($("h1").text()).toMatch("SBI to use?");
    expect($("title").text().trim()).toContain(
      "What is your SBI? - Get funding to improve animal health and welfare"
    );
    ok($);
  });

  describe("POST route", () => {
    let crumb;

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("POST to dev login successfully returns a 302 and redirects to journey", async () => {
      businessEligibleToApply.mockResolvedValueOnce("no previous application");

      const options = {
        method: "POST",
        url: "/apply/endemics/dev-sign-in",
        payload: {
          crumb,
          sbi: "123456789",
        },
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual("/apply/endemics/check-details");
    });

    test("POST to dev login with an SBI which already has applied redirects user to the dev sign in exception page", async () => {
      const sbi = "123456789";
      businessEligibleToApply.mockImplementation(() => {
        throw new AlreadyAppliedError(
          `Business with SBI ${sbi} already has an endemics agreement`
        );
      });

      const options = {
        method: "POST",
        url: "/apply/endemics/dev-sign-in",
        payload: {
          crumb,
          sbi,
        },
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      const $ = cheerio.load(res.payload);
      expect(res.statusCode).toBe(400);
      expect($("h1").text().trim()).toMatch(
        `You cannot sign in with SBI ${sbi}`
      );
    });

    test("POST to dev login which throws an error redirects to standard error 500 page", async () => {
      const sbi = "123456789";
      businessEligibleToApply.mockImplementation(() => {
        throw new Error("I am an error");
      });

      const options = {
        method: "POST",
        url: "/apply/endemics/dev-sign-in",
        payload: {
          crumb,
          sbi,
        },
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      const $ = cheerio.load(res.payload);
      expect(res.statusCode).toBe(500);
      expect($("h1").text()).toEqual(
        "Sorry, there is a problem with the service"
      );
    });
  });
});
