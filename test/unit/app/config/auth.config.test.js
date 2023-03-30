describe('Auth config', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  test.each([
    {
      processEnv: {
        enabled: true,
        tenant: 'testtenant',
        policy: 'testpolicy',
        redirectUri: 'http://localhost:3000/apply/signin-oidc',
        jwtIssuerId: 'dummy_jwt_issuer_id',
        clientId: 'dummyclientid',
        clientSecret: 'dummyclientsecret',
        serviceId: 'dummyserviceid'
      },
      config: {
        defraId: {
          enabled: true,
          hostname: 'https://testtenant.b2clogin.com/testtenant.onmicrosoft.com',
          oAuthAuthorisePath: '/oauth2/v2.0/authorize',
          policy: 'testpolicy',
          redirectUri: 'http://localhost:3000/apply/signin-oidc',
          tenantName: 'testtenant',
          jwtIssuerId: 'dummy_jwt_issuer_id',
          clientId: 'dummyclientid',
          clientSecret: 'dummyclientsecret',
          serviceId: 'dummyserviceid',
          scope: 'openid dummyclientid offline_access'
        }
      }
    }
  ])('GIVEN $processEnv EXPECT $config', (testCase) => {
    process.env.DEFRA_ID_ENABLED = testCase.processEnv.enabled
    process.env.DEFRA_ID_TENANT = testCase.processEnv.tenant
    process.env.DEFRA_ID_POLICY = testCase.processEnv.policy
    process.env.DEFRA_ID_REDIRECT_URI = testCase.processEnv.redirectUri
    process.env.DEFRA_ID_JWT_ISSUER_ID = testCase.processEnv.jwtIssuerId
    process.env.DEFRA_ID_CLIENT_ID = testCase.processEnv.clientId
    process.env.DEFRA_ID_CLIENT_SECRET = testCase.processEnv.clientSecret
    process.env.DEFRA_ID_SERVICE_ID = testCase.processEnv.serviceId

    const config = require('../../../../app/config/auth')

    expect(config).toEqual(testCase.config)
  })

  test.each([
    {
      processEnv: {
        redirectUri: 'not a uri'
      },
      errorMessage: 'The auth config is invalid. "defraId.redirectUri" must be a valid uri'
    }
  ])('GIVEN $processEnv EXPECT $errorMessage', (testCase) => {
    process.env.DEFRA_ID_REDIRECT_URI = testCase.processEnv.redirectUri
    expect(
      () => require('../../../../app/config/auth')
    ).toThrow(testCase.errorMessage)
  })

  afterEach(() => {
    process.env = env
  })
})
