const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const config = require('../../../../app/config')
const sessionKeys = require('../../../../app/session/keys')

const MOCK_NOW = new Date()

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
    jest.clearAllMocks()
    jest.resetModules()
    resetAllWhenMocks()
    dateSpy.mockRestore()
  })

  describe('GET', () => {
    test.each([
      {
        toString: () => 'HTTP 200',
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
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(1)
      expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
        expect.anything(),
        sessionKeys.selectYourBusiness.eligbleBusinesses,
        [
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
      )
      expect($('title').text()).toEqual(config.serviceName)
      expect($('.govuk-fieldset__heading').first().text().trim()).toEqual('Choose the SBI you would like to apply for:')
      /*
        testCase.expect.consoleLogs.forEach(
          (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
        )
      */
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
            whichBusiness: '123'
          }
        },
        when: {
        },
        expect: {
          consoleLogs: [
            `${MOCK_NOW.toISOString()} Selected business: ${JSON.stringify({})}`
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
          sessionKeys.selectYourBusiness.eligbleBusinesses
        )
        .mockReturnValue([])

      const response = await global.__SERVER__.inject(options)

      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual(`${config.urlPrefix}/org-review`)
      expect(session.setSelectYourBusiness).toHaveBeenCalledTimes(2)
      expect(session.setSelectYourBusiness).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything()
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
          sessionKeys.selectYourBusiness.eligbleBusinesses
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
