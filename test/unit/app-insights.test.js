describe('App Insight', () => {
  const appInsights = require('applicationinsights')
  jest.mock('applicationinsights')

  const startMock = jest.fn()
  const setupMock = jest.fn(() => {
    return {
      start: startMock
    }
  })
  appInsights.setup = setupMock
  const cloudRoleTag = 'cloudRoleTag'
  const tags = {}
  appInsights.defaultClient = {
    context: {
      keys: {
        cloudRole: cloudRoleTag
      },
      tags
    },
    trackException: jest.fn()
  }

  const consoleLogSpy = jest.spyOn(console, 'log')

  const appInsightsKey = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING

  beforeEach(() => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = appInsightsKey
  })

  test('is started when env var exists', () => {
    const appName = 'test-app'
    process.env.APPINSIGHTS_CLOUDROLE = appName
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'something'
    const insights = require('../../app/insights')

    insights.setup()

    expect(setupMock).toHaveBeenCalledTimes(1)
    expect(startMock).toHaveBeenCalledTimes(1)
    expect(tags[cloudRoleTag]).toEqual(appName)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('App Insights Running')
  })

  test('logs not running when env var does not exist', () => {
    const insights = require('../../app/insights')

    insights.setup()

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith('App Insights Not Running!')
  })

  test('logException', () => {
    const { logException } = require('../../app/insights')

    expect(logException).toBeDefined()

    logException({}, {})

    const event = {
      error: 'mock_error',
      request: 'mock_request'
    }

    let req = {
      statusCode: 200,
      yar: { id: 'mock_id' },
      payload: 'mock_paylodd'
    }
    logException(req, event)
    expect(appInsights.defaultClient.trackException).toHaveBeenCalled()

    req = {
      statusCode: 200,
      payload: 'mock_paylodd'
    }
    expect(appInsights.defaultClient.trackException).toHaveBeenCalled()
  })
})
