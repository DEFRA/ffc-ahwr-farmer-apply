import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";

jest.mock("../../../../app/session");
jest.mock("../../../../app/config/index", () => ({
  ...jest.requireActual("../../../../app/config/index"),
  env: "development"
}));

describe("Dev auth plugin test", () => {
  describe("Accessing secured route without auth cookie redirects to dev-defraid login", () => {
    let urlPrefix;
    let url;

    beforeAll(async () => {
      jest.resetAllMocks();
      jest.resetModules();

      urlPrefix = config.urlPrefix;
      url = `${urlPrefix}/endemics/check-details`;
    });

    let server;

    beforeAll(async () => {
      config.env = "development";
      server = await createServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    test("when not logged in redirects to dev-defraid", async () => {
     const options = {
        method: "GET",
        url,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toMatch("/dev-defraid");
    });

  });
});
