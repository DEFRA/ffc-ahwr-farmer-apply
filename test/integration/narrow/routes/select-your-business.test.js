//const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const config = require('../../../../app/config')

const MOCK_NOW = new Date()

const API_URL = `${config.urlPrefix}/select-your-business`

describe('API select-your-business', () => {
  // let logSpy
  let session

  beforeAll(() => {
    // logSpy = jest.spyOn(console, 'log')

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    // resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'GET 200',
      given: {
      },
      when: {
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Log message: ${JSON.stringify({})}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    const options = {
      method: 'GET',
      url: `${API_URL}`,
      auth: {
        credentials: { reference: '1111', sbi: '111111111' },
        strategy: 'cookie'
      }
    }

    const response = await global.__SERVER__.inject(options)
    const $ = cheerio.load(response.payload)

    expect(response.statusCode).toBe(200)
    expect(session.setFarmerApplyData).toHaveBeenCalledTimes(1)
    expect(session.setFarmerApplyData).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything()
    )
    // expect($('.govuk-heading-l').first().text()).toEqual('')
    expect($('title').text()).toEqual(config.serviceName)
    /*
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    */
  })
})
