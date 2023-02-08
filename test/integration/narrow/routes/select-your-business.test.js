const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const Wreck = require('@hapi/wreck')
const getCrumbs = require('../../../utils/get-crumbs')
const config = require('../../../../app/config')
const sessionKeys = require('../../../../app/session/keys')

const applicationConfig = require('../../../../app/api-requests/application-api.config')
const eligibilityConfig = require('../../../../app/api-requests/eligibility-api.config')

const MOCK_NOW = new Date()

jest.mock('@hapi/wreck')

const API_URL = `${config.urlPrefix}/select-your-business`

describe('API select-your-business', () => {
  let dateSpy
  let logSpy
  let session

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
        toString: () => 'HTTP 200 - businesses were found',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          eligibilityApi: {
            businesses: [
              {
                sbi: '111222333',
                crn: '1112223333',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm',
                address: '1 Some Road'
              },
              {
                sbi: '111222334',
                crn: '1112223334',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 2',
                address: '2 Some Road'
              },
              {
                sbi: '111222335',
                crn: '1112223335',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 3',
                address: '3 Some Road'
              },
              {
                sbi: '111222336',
                crn: '1112223336',
                email: 'business@email.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 4',
                address: '4 Some Road'
              }
            ]
          },
          applicationApi: {
            latestApplications: [
              {
                id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                reference: 'AHWR-AAAA-AAAA',
                data: {
                  reference: 'string',
                  declaration: true,
                  offerStatus: 'accepted',
                  whichReview: 'sheep',
                  organisation: {
                    crn: 1112223334,
                    sbi: 111222334,
                    name: 'My Amazing Farm',
                    email: 'business@email.com',
                    address: '1 Example Road',
                    farmerName: 'Mr Farmer'
                  },
                  eligibleSpecies: 'yes',
                  confirmCheckDetails: 'yes'
                },
                claimed: false,
                createdAt: '2023-01-17 13:55:20',
                updatedAt: '2023-01-17 13:55:20',
                createdBy: 'David Jones',
                updatedBy: 'David Jones',
                statusId: 7
              },
              {
                id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                reference: 'AHWR-AAAA-AAAA',
                data: {
                  reference: 'string',
                  declaration: true,
                  offerStatus: 'accepted',
                  whichReview: 'sheep',
                  organisation: {
                    crn: 1112223335,
                    sbi: 111222335,
                    name: 'My Amazing Farm',
                    email: 'business@email.com',
                    address: '3 Some Road',
                    farmerName: 'Mr Farmer'
                  },
                  eligibleSpecies: 'yes',
                  confirmCheckDetails: 'yes'
                },
                claimed: false,
                createdAt: '2023-01-17 13:55:20',
                updatedAt: '2023-01-17 13:55:20',
                createdBy: 'David Jones',
                updatedBy: 'David Jones',
                statusId: 2
              },
              {
                id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                reference: 'AHWR-AAAA-AAAA',
                data: {
                  reference: 'string',
                  declaration: true,
                  offerStatus: 'accepted',
                  whichReview: 'sheep',
                  organisation: {
                    crn: 1112223336,
                    sbi: 111222336,
                    name: 'My Amazing Farm',
                    email: 'business@email.com',
                    address: '4 Some Road',
                    farmerName: 'Mr Farmer'
                  },
                  eligibleSpecies: 'yes',
                  confirmCheckDetails: 'yes'
                },
                claimed: false,
                createdAt: '2023-01-17 13:55:20',
                updatedAt: '2023-01-17 13:55:20',
                createdBy: 'David Jones',
                updatedBy: 'David Jones',
                statusId: 1
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
            `${MOCK_NOW.toISOString()} Getting latest applications by: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Latest Applications: ${JSON.stringify(
              [
                {
                  id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                  reference: 'AHWR-AAAA-AAAA',
                  data: {
                    organisation: {
                      sbi: 111222334,
                      email: 'business@email.com'
                    }
                  },
                  statusId: 7
                },
                {
                  id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                  reference: 'AHWR-AAAA-AAAA',
                  data: {
                    organisation: {
                      sbi: 111222335,
                      email: 'business@email.com'
                    }
                  },
                  statusId: 2
                },
                {
                  id: 'eaf9b180-9993-4f3f-a1ec-4422d48edf92',
                  reference: 'AHWR-AAAA-AAAA',
                  data: {
                    organisation: {
                      sbi: 111222336,
                      email: 'business@email.com'
                    }
                  },
                  statusId: 1
                }
              ]
            )}`,
            `${MOCK_NOW.toISOString()} Getting eligible businesses: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Eligible Businesses: ${JSON.stringify(
              [
                {
                  sbi: '111222333',
                  email: 'business@email.com'
                },
                {
                  sbi: '111222334',
                  email: 'business@email.com'
                },
                {
                  sbi: '111222335',
                  email: 'business@email.com'
                },
                {
                  sbi: '111222336',
                  email: 'business@email.com'
                }
              ]
            )}`,
            `${MOCK_NOW.toISOString()} Appliable businesses: ${JSON.stringify(
              [
                {
                  sbi: '111222333',
                  email: 'business@email.com'
                },
                {
                  sbi: '111222334',
                  email: 'business@email.com'
                },
                {
                  sbi: '111222335',
                  email: 'business@email.com'
                }
              ]
            )}`
          ],
          appliableBusinesses: [
            {
              sbi: '111222333',
              crn: '1112223333',
              email: 'business@email.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm',
              address: '1 Some Road'
            },
            {
              sbi: '111222334',
              crn: '1112223334',
              email: 'business@email.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm 2',
              address: '2 Some Road'
            },
            {
              sbi: '111222335',
              crn: '1112223335',
              email: 'business@email.com',
              farmerName: 'Mr Farmer',
              name: 'My Amazing Farm 3',
              address: '3 Some Road'
            }
          ]
        }
      },
      {
        toString: () => 'HTTP 302 - no businesses found',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          eligibilityApi: {
            businesses: []
          },
          applicationApi: {
            latestApplications: []
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
            `${MOCK_NOW.toISOString()} Getting latest applications by: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Latest Applications: []`,
            `${MOCK_NOW.toISOString()} Getting eligible businesses: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Eligible Businesses: []`,
            `${MOCK_NOW.toISOString()} No eligible business found`
          ],
          appliableBusinesses: []
        }
      }
    ])('%s', async (testCase) => {
      const statusCode = testCase.expect.http.statusCode
      const options = {
        method: 'GET',
        url: `${API_URL}?businessEmail=${testCase.given.businessEmail}`,
        auth: {
          credentials: { reference: '1111', sbi: '111222333' },
          strategy: 'cookie'
        }
      }
      const applicationExpectedResponse = {
        payload: testCase.when.applicationApi.latestApplications,
        res: { statusCode }
      }
      const eligibilityExpectedResponse = {
        payload: testCase.when.eligibilityApi.businesses,
        res: { statusCode }
      }
      when(Wreck.get)
        .calledWith(
          `${applicationConfig.uri}/applications/latest?businessEmail=${testCase.given.businessEmail}`,
          { json: true }
        )
        .mockResolvedValue(applicationExpectedResponse)
      when(Wreck.get)
        .calledWith(
          `${eligibilityConfig.uri}/businesses?emailAddress=${testCase.given.businessEmail}`,
          { json: true }
        )
        .mockResolvedValue(eligibilityExpectedResponse)

      const response = await global.__SERVER__.inject(options)
      const $ = cheerio.load(response.payload)

      expect(response.statusCode).toBe(testCase.expect.http.statusCode)
      expect(response.headers.location).toEqual(testCase.expect.http.headers.location)
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(
        testCase.when.eligibilityApi.businesses.length > 0 ? 1 : 0
      )
      if (testCase.when.eligibilityApi.businesses.length > 0) {
        expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
          expect.anything(),
          sessionKeys.selectYourBusiness.eligibleBusinesses,
          testCase.expect.appliableBusinesses
        )
      }
      if (!testCase.expect.http.headers.location) {
        expect($('title').text()).toEqual(config.serviceName)
        expect($('.govuk-fieldset__heading').first().text().trim()).toEqual('Choose the SBI you would like to apply for:')
      }
      testCase.expect.consoleLogs.forEach(
        (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
      )
    })

    test.each([
      {
        toString: () => 'HTTP 400 - "businessEmail" param is missing',
        given: {
          queryString: ''
        }
      }
    ])('%s', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}${testCase.given.queryString}`,
        auth: {
          credentials: { reference: '1111', sbi: '111222333' },
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
        toString: () => 'HTTP 200 - business selected',
        given: {
          payload: {
            whichBusiness: '111222333'
          }
        },
        when: {
          session: {
            businesses: [
              {
                sbi: '111222333',
                crn: '1112223333',
                email: 'liam.wilson@kainos.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm',
                address: '1 Some Road'
              },
              {
                sbi: '111222334',
                crn: '1112223334',
                email: 'liam.wilson@kainos.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 2',
                address: '2 Some Road'
              }
            ]
          }
        },
        expect: {
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Selected business: ${JSON.stringify({
              sbi: '111222333',
              crn: '1112223333',
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
          credentials: { reference: '1111', sbi: '111222333' },
          strategy: 'cookie'
        }
      }
      when(session.getSelectYourBusiness)
        .calledWith(
          expect.anything(),
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        .mockReturnValue(testCase.when.session.businesses)

      const response = await global.__SERVER__.inject(options)

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual(`${config.urlPrefix}/org-review`)
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(1)
      expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.selectYourBusiness.whichBusiness,
        '111222333'
      )
      expect(session.setFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(session.setFarmerApplyData).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.farmerApplyData.organisation,
        {
          sbi: '111222333',
          crn: '1112223333',
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
        },
        when: {
          session: {
            businesses: [
              {
                sbi: '111222333',
                crn: '1112223333',
                email: 'liam.wilson@kainos.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm',
                address: '1 Some Road'
              },
              {
                sbi: '111222334',
                crn: '1112223334',
                email: 'liam.wilson@kainos.com',
                farmerName: 'Mr Farmer',
                name: 'My Amazing Farm 2',
                address: '2 Some Road'
              }
            ]
          }
        },
        expect: {
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Error on post request to /apply/select-your-business: ValidationError: "whichBusiness" is required`
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
          credentials: { reference: '1111', sbi: '111111111' },
          strategy: 'cookie'
        }
      }
      when(session.getSelectYourBusiness)
        .calledWith(
          expect.anything(),
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        .mockReturnValue(testCase.when.session.businesses)

      const response = await global.__SERVER__.inject(options)
      const $ = cheerio.load(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect($('title').text()).toEqual(config.serviceName)
      expect($('.govuk-fieldset__heading').first().text().trim()).toEqual('Choose the SBI you would like to apply for:')
      testCase.expect.consoleLogs.forEach(
        (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
      )
    })
  })
})
