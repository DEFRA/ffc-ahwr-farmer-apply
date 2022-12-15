describe('EligibilityAPI config', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  test.each([
    {
      processEnv: {
        uri: 'http://host:3333/api',
        enabled: true
      },
      config: {
        uri: 'http://host:3333/api',
        enabled: true
      }
    }
  ])('GIVEN $processEnv EXPECT $config', (testCase) => {
    process.env.ELIGIBILITY_API_URI = testCase.processEnv.uri
    process.env.ELIGIBILITY_API_ENABLED = testCase.processEnv.enabled

    const config = require('../../../../app/api-requests/eligibility-api.config')

    expect(config).toEqual(testCase.config)
  })

  test.each([
    {
      processEnv: {
        uri: 'uri',
        enabled: true
      },
      errorMessage: 'The config is invalid: "uri" must be a valid uri'
    },
    {
      processEnv: {
        uri: 'http://host:3333/api',
        enabled: 'yes'
      },
      errorMessage: 'The config is invalid: "enabled" must be a boolean'
    }
  ])('GIVEN $processEnv EXPECT $errorMessage', (testCase) => {
    process.env.ELIGIBILITY_API_URI = testCase.processEnv.uri
    process.env.ELIGIBILITY_API_ENABLED = testCase.processEnv.enabled
    expect(
      () => require('../../../../app/api-requests/eligibility-api.config')
    ).toThrow(testCase.errorMessage);
  })

  afterEach(() => {
    process.env = env
  })
})
