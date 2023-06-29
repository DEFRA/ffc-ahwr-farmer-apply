describe('Notify config', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
  })

  test.each([
    {
      processEnv: {
        apiKey: '-9f9c8021-aec1-4d17-b83d-19d077d48b2b-4670a098-9a0c-408e-914c-1b74dbb84711',
        registerYourInterest: '5d1f260b3ea64a74a8b9d60e5c5a5a5f',
        accessGranted: '4e4b463dcf6d4fcab277a102dba5a5e9',
        accessNotGranted: '2f6a70fc6db84fc7b29eaa04cba5a5e2'
      },
      config: {
        apiKey: '-9f9c8021-aec1-4d17-b83d-19d077d48b2b-4670a098-9a0c-408e-914c-1b74dbb84711',
        emailTemplates: {
          registerYourInterest: '5d1f260b3ea64a74a8b9d60e5c5a5a5f',
          accessGranted: '4e4b463dcf6d4fcab277a102dba5a5e9',
          accessNotGranted: '2f6a70fc6db84fc7b29eaa04cba5a5e2'
        }
      }
    },
    {
      processEnv: {
        apiKey: '-9f9c8021-aec1-4d17-b83d-19d077d48b2b-4670a098-9a0c-408e-914c-1b74dbb84711',
        registerYourInterest: '5d1f260b3ea64a74a8b9d60e5c5a5a5f',
        accessGranted: '4e4b463dcf6d4fcab277a102dba5a5e9',
        accessNotGranted: '2f6a70fc6db84fc7b29eaa04cba5a5e2'
      },
      config: {
        apiKey: '-9f9c8021-aec1-4d17-b83d-19d077d48b2b-4670a098-9a0c-408e-914c-1b74dbb84711',
        emailTemplates: {
          registerYourInterest: '5d1f260b3ea64a74a8b9d60e5c5a5a5f',
          accessGranted: '4e4b463dcf6d4fcab277a102dba5a5e9',
          accessNotGranted: '2f6a70fc6db84fc7b29eaa04cba5a5e2'
        }
      }
    }
  ])('GIVEN $processEnv EXPECT $config', (testCase) => {
    process.env.NOTIFY_API_KEY = testCase.processEnv.apiKey
    process.env.NOTIFY_TEMPLATE_ID_DEFRA_ID_REGISTER_INTEREST = testCase.processEnv.registerYourInterest
    process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_GRANTED = testCase.processEnv.accessGranted
    process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_NOT_GRANTED = testCase.processEnv.accessNotGranted
    const config = require('../../../../app/config/notify')

    expect(config).toEqual(testCase.config)
  })

  test.each([
    {
      processEnv: {
        apiKey: 'wrong',
        registerYourInterest: 'wrong',
        accessGranted: 'wrong',
        accessNotGranted: 'wrong'
      },
      errorMessage: 'The notify config is invalid. "apiKey" with value "wrong" fails to match the required pattern: /.*-[\\da-f]{8}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{12}-[\\da-f]{8}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{12}/. "emailTemplates.registerYourInterest" must be a valid GUID. "emailTemplates.accessGranted" must be a valid GUID. "emailTemplates.accessNotGranted" must be a valid GUID'
    }
  ])('GIVEN $processEnv EXPECT $errorMessage', (testCase) => {
    process.env.NOTIFY_API_KEY = testCase.processEnv.apiKey
    process.env.NOTIFY_TEMPLATE_ID_DEFRA_ID_REGISTER_INTEREST = testCase.processEnv.registerYourInterest
    process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_GRANTED = testCase.processEnv.accessGranted
    process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_NOT_GRANTED = testCase.processEnv.accessNotGranted
    expect(
      () => require('../../../../app/config/notify')
    ).toThrow(testCase.errorMessage)
  })

  afterEach(() => {
    process.env = env
  })
})
