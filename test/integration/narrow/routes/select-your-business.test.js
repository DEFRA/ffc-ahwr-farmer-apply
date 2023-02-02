const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const config = require('../../../../app/config')
const sessionKeys = require('../../../../app/session/keys')

const MOCK_NOW = new Date()

jest.mock('../../../../app/api-requests/eligibility-api')

const API_URL = `${config.urlPrefix}/select-your-business`

describe('API select-your-business', () => {
  let dateSpy
  let logSpy
  let session
  let eligibilityApi

  beforeAll(() => {
    dateSpy = jest
      .spyOn(global, 'Date')
      .mockImplementation(() => MOCK_NOW)
    Date.now = jest.fn(() => MOCK_NOW.valueOf())

    logSpy = jest.spyOn(console, 'log')

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')

    jest.mock('../../../../app/config', () => {
      const originalModule = jest.requireActual('../../../../app/config')
      return {
        ...originalModule,
        selectYourBusiness: {
          enabled: true
        }
      }
    })

    eligibilityApi = require('../../../../app/api-requests/eligibility-api')
  })

  afterAll(() => {
    jest.resetModules()
    resetAllWhenMocks()
    dateSpy.mockRestore()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    test.each([
      {
        toString: () => 'HTTP 200',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          eligibilityApi: {
            businesses: [
              {
                sbi: '122333',
                crn: '112222',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm',
                address: '1 Some Road'
              },
              {
                sbi: '122334',
                crn: '112224',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 2',
                address: '2 Some Road'
              }
            ]
          }
        },
        expect: {
          http: {
            statusCode: 200,
            headers: {
              location: undefined
            }
          },
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Log message: ${JSON.stringify({})}`
          ]
        }
      },
      {
        toString: () => 'HTTP 200',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          eligibilityApi: {
            businesses: []
          }
        },
        expect: {
          http: {
            statusCode: 302,
            headers: {
              location: 'no-eligible-businesses'
            }
          },
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Log message: ${JSON.stringify({})}`
          ]
        }
      }
    ])('%s', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?businessEmail=${testCase.given.businessEmail}`,
        auth: {
          credentials: { reference: '1111', sbi: '122333' },
          strategy: 'cookie'
        }
      }
      when(eligibilityApi.getBusinesses)
        .calledWith(testCase.given.businessEmail)
        .mockResolvedValue(testCase.when.eligibilityApi.businesses)

      const response = await global.__SERVER__.inject(options)
      const $ = cheerio.load(response.payload)

      expect(response.statusCode).toBe(testCase.expect.http.statusCode)
      expect(response.headers.location).toEqual(testCase.expect.http.headers.location)
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(1)
      expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.selectYourBusiness.eligibleBusinesses,
        testCase.when.eligibilityApi.businesses
      )
      if (testCase.expect.http.headers.location) {

      } else {
        expect($('title').text()).toEqual(config.serviceName)
        expect($('.govuk-fieldset__heading').first().text().trim()).toEqual('Choose the SBI you would like to apply for:')
      }
      /*
        testCase.expect.consoleLogs.forEach(
          (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
        )
      */
    })

    test.each([
      {
        toString: () => 'HTTP 400',
        given: {
          queryString: ''
        }
      }
    ])('%s', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}${testCase.given.queryString}`,
        auth: {
          credentials: { reference: '1111', sbi: '122333' },
          strategy: 'cookie'
        }
      }

      const response = await global.__SERVER__.inject(options)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
    })
  })

  describe('POST', () => {
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      {
        toString: () => 'HTTP 200',
        given: {
          payload: {
            whichBusiness: '122333'
          }
        },
        when: {
          businesses: [
            {
              sbi: '122333',
              crn: '112222',
              email: 'liam.wilson@kainos.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm',
              address: '1 Some Road'
            },
            {
              sbi: '122334',
              crn: '112224',
              email: 'liam.wilson@kainos.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm 2',
              address: '2 Some Road'
            }
          ]
        },
        expect: {
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Selected business: ${JSON.stringify({
              sbi: '122333',
              crn: '112222',
              email: 'liam.wilson@kainos.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm',
              address: '1 Some Road'
            })}`
          ]
        }
      }
    ])('%s', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${API_URL}`,
        payload: { crumb, ...testCase.given.payload },
        headers: { cookie: `crumb=${crumb}` },
        auth: {
          credentials: { reference: '1111', sbi: '122333' },
          strategy: 'cookie'
        }
      }
      when(session.getSelectYourBusiness)
        .calledWith(
          expect.anything(),
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        .mockReturnValue(testCase.when.businesses)

      const response = await global.__SERVER__.inject(options)

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual(`${config.urlPrefix}/org-review`)
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(1)
      expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.selectYourBusiness.whichBusiness,
        '122333'
      )
      expect(session.setFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(session.setFarmerApplyData).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.farmerApplyData.organisation,
        {
          sbi: '122333',
          crn: '112222',
          email: 'liam.wilson@kainos.com',
          farmerName: 'Mr Farmer',
          name: 'My Amazing Farm',
          address: '1 Some Road'
        }
      )
      testCase.expect.consoleLogs.forEach(
        (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
      )
    })

    test.each([
      {
        toString: () => 'HTTP 400 - empty payload',
        given: {
          payload: {}
        }
      }
    ])('%s', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${API_URL}`,
        payload: { crumb, ...testCase.given.payload },
        headers: { cookie: `crumb=${crumb}` },
        auth: {
          credentials: { reference: '1111', sbi: '111111111' },
          strategy: 'cookie'
        }
      }
      when(session.getSelectYourBusiness)
        .calledWith(
          expect.anything(),
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        .mockReturnValue([])

      const response = await global.__SERVER__.inject(options)
      const $ = cheerio.load(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect($('title').text()).toEqual(config.serviceName)
      expect($('.govuk-fieldset__heading').first().text().trim()).toEqual('Choose the SBI you would like to apply for:')
    })
  })
})
