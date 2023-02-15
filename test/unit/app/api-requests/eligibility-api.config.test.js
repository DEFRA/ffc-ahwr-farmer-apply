describe('EligibilityAPI config', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  test.each([
    {
      processEnv: {
        uri: 'http://host:3333/api'
      },
      config: {
        uri: 'http://host:3333/api'
      }
    }
  ])('GIVEN $processEnv EXPECT $config', (testCase) => {
    process.env.ELIGIBILITY_API_URI = testCase.processEnv.uri

    const config = require('../../../../app/api-requests/eligibility-api.config')

    expect(config).toEqual(testCase.config)
  })

  test.each([
    {
      processEnv: {
        uri: 'uri'
      },
      errorMessage: 'The config is invalid: "uri" must be a valid uri'
    }
  ])('GIVEN $processEnv EXPECT $errorMessage', (testCase) => {
    process.env.ELIGIBILITY_API_URI = testCase.processEnv.uri
    expect(
      () => require('../../../../app/api-requests/eligibility-api.config')
    ).toThrow(testCase.errorMessage)
  })

  afterEach(() => {
    process.env = env
  })
})
