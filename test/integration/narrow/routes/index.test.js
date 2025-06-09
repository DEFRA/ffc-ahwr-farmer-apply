import { createServer } from "../../../../app/server";

describe("Farmer apply home page test", () => {
  jest.mock("../../../../app/config", () => ({
    ...jest.requireActual("../../../../app/config"),
    authConfig: {
      defraId: {
        hostname: "https://testtenant.b2clogin.com/testtenant.onmicrosoft.com",
        oAuthAuthorisePath: "/oauth2/v2.0/authorize",
        policy: "testpolicy",
        dashboardRedirectUri: "http://localhost:3003/endemics/signin-oidc",
        clientId: "dummyclientid",
        serviceId: "dummyserviceid",
        scope: "openid dummyclientid offline_access",
      }
    },
  }));

  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET / route returns 302 when not logged in", async () => {
    const options = {
      method: "GET",
      url: "/apply/start",
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toEqual("/apply/endemics/start");
  });
});
