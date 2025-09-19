import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";

jest.mock("../../../../app/session");

describe("Auth plugin test", () => {
  describe("Accessing secured route without auth cookie redirects to dashboard /sign-in", () => {
    let urlPrefix;
    let url;

    beforeAll(async () => {
      jest.resetAllMocks();
      jest.resetModules();

      urlPrefix = config.urlPrefix;
      url = `${urlPrefix}/endemics/you-can-claim-multiple`;
    });

    let server;

    beforeAll(async () => {
      server = await createServer();
      await server.initialize();
    });

    afterAll(async () => {
      await server.stop();
    });

    test("when not logged in redirects to dashboard /sign-in", async () => {
      const options = {
        method: "GET",
        url,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(`${config.dashboardServiceUri}/sign-in`);
    });
  });
});
