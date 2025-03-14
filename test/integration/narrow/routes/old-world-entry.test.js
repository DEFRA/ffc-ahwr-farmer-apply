import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";

describe("Annual Health and Welfare Review landing page", () => {
  beforeAll(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    jest.mock("../../../../app/session");
    jest.mock("../../../../app/config", () => ({
      ...jest.requireActual("../../../../app/config"),
      endemics: {
        enabled: false,
      },
      authConfig: {
        defraId: {
          hostname: "https://tenant.b2clogin.com/tenant.onmicrosoft.com",
          oAuthAuthorisePath: "/oauth2/v2.0/authorize",
          policy: "b2c_1a_signupsigninsfi",
          redirectUri: "http://localhost:3000/apply/signin-oidc",
          clientId: "dummy_client_id",
          serviceId: "dummy_service_id",
          scope: "openid dummy_client_id offline_access",
        },
        ruralPaymentsAgency: {
          hostname: "dummy-host-name",
          getPersonSummaryUrl: "dummy-get-person-summary-url",
          getOrganisationPermissionsUrl:
            "dummy-get-organisation-permissions-url",
          getOrganisationUrl: "dummy-get-organisation-url",
        },
      },
    }));
  });

  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("GET / route returns 200 when not logged in", async () => {
    const options = {
      method: "GET",
      url: `${config.urlPrefix}/`,
    };

    const res = await server.inject(options);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toEqual("/apply/endemics/start");
  });
});
