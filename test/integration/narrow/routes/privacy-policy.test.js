import * as cheerio from "cheerio";
import { config } from "../../../../app/config/index.js";
import { ok } from "../../../utils/phase-banner-expect";
import { createServer } from "../../../../app/server.js";

const { urlPrefix } = config;

describe("Farmer apply privacy policy page test", () => {
  beforeAll(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    jest.mock("../../../../app/session");
    jest.mock("../../../../app/config");
  });

  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET /privacy-policy route returns 200 when not logged in", async () => {
    const options = {
      method: "GET",
      url: `${urlPrefix}/privacy-policy`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(200);
    const $ = cheerio.load(res.payload);
    expect($(".govuk-heading-l").text()).toEqual("Privacy notice");

    expect($("title").text()).toContain(
      "Get funding to improve animal health and welfare - GOV.UKGOV.UK",
    );
    ok($);
  });
});
