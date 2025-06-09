import { getAuthConfig } from "../../../../app/config/auth.js";

describe("Auth config", () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    jest.mock("../../../../app/config/auth", () => ({
      ...jest.requireActual("../../../../app/config/auth"),
      defraId: {
        hostname: "https://tenant.b2clogin.com/tenant.onmicrosoft.com",
        oAuthAuthorisePath: "/oauth2/v2.0/authorize",
        policy: "b2c_1a_signupsigninsfi",
        clientId: "dummy_client_id",
        serviceId: "dummy_service_id",
        scope: "openid dummy_client_id offline_access",
      },
    }));
  });

  test.each([
    {
      processEnv: {
        tenant: "testtenant",
        policy: "testpolicy",
        dashboardRedirectUri: "http://localhost:3003/signin-oidc",
        clientId: "dummyclientid",
        serviceId: "dummyserviceid",
      },
      config: {
        defraId: {
          hostname:
            "https://testtenant.b2clogin.com/testtenant.onmicrosoft.com",
          oAuthAuthorisePath: "/oauth2/v2.0/authorize",
          policy: "testpolicy",
          dashboardRedirectUri: "http://localhost:3003/signin-oidc",
          clientId: "dummyclientid",
          serviceId: "dummyserviceid",
          scope: "openid dummyclientid offline_access",
        },
      },
    },
  ])("GIVEN $processEnv EXPECT $config", (testCase) => {
    process.env.DEFRA_ID_TENANT = testCase.processEnv.tenant;
    process.env.DEFRA_ID_POLICY = testCase.processEnv.policy;
    process.env.DEFRA_ID_DASHBOARD_REDIRECT_URI =
      testCase.processEnv.dashboardRedirectUri;
    process.env.DEFRA_ID_CLIENT_ID = testCase.processEnv.clientId;
    process.env.DEFRA_ID_SERVICE_ID = testCase.processEnv.serviceId;

    const config = getAuthConfig();

    expect(config).toEqual(testCase.config);
  });

  test.each([
    {
      processEnv: {
        dashboardRedirectUri: "not a uri",
      },
      errorMessage:
        'The auth config is invalid. "defraId.dashboardRedirectUri" must be a valid uri',
    },
  ])("GIVEN $processEnv EXPECT $errorMessage", (testCase) => {
    process.env.DEFRA_ID_DASHBOARD_REDIRECT_URI = testCase.processEnv.dashboardRedirectUri;
    expect(() => require("../../../../app/config/auth")).toThrow(
      testCase.errorMessage,
    );
  });

  afterEach(() => {
    process.env = env;
  });
});
