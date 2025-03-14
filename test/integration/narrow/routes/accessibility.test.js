import * as cheerio from "cheerio";
import { ok } from "../../../utils/phase-banner-expect";
import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server";

describe("Farmer apply accessibility page test", () => {
  let server;

  beforeAll(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    server = await createServer();
    await server.initialize();

    jest.mock("../../../../app/session");
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET / route returns 200 when not logged in", async () => {
    const options = {
      method: "GET",
      url: `${config.urlPrefix}/accessibility`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(200);
    const $ = cheerio.load(res.payload);
    expect($(".govuk-heading-l").text()).toMatch(
      "Accessibility statement: Get funding to improve animal health and welfare"
    );
    expect($("title").text()).toMatch(
      "Accessibility statement - Get funding to improve animal health and welfare - GOV.UKGOV.UK"
    );
    ok($);
  });
});
