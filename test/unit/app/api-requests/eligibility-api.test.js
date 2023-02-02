const { when, resetAllWhenMocks } = require('jest-when')
const Wreck = require('@hapi/wreck')
const mockConfig = require('../../../../app/config')

jest.mock('@hapi/wreck')

const consoleErrorSpy = jest.spyOn(console, 'error')

const MOCK_NOW = new Date()

const mockEligibilityApiUri = 'http://internal:3333/api'

describe('Eligibility API', () => {
  let eligibilityApi

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/config', () => ({
      ...mockConfig,
      eligibilityApi: {
        uri: mockEligibilityApiUri
      }
    }))
    eligibilityApi = require('../../../../app/api-requests/eligibility-api')
  })

  afterEach(() => {
    jest.resetAllMocks()
    resetAllWhenMocks()
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
  })

  describe('getEligibility', () => {
    test('given an eligible business email address it returns an object containing a user data', async () => {
      const expectedResponse = {
        payload: {
          farmerName: 'David Smith',
          name: 'David\'s Farm',
          sbi: '441111114',
          crn: '4411111144',
          address: 'Some Road, London, MK55 7ES',
          email: 'name@email.com'
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getEligibility(BUSINESS_EMAIL_ADDRESS)

      expect(response).not.toBeNull()
      expect(response.farmerName).toStrictEqual(expectedResponse.payload.farmerName)
      expect(response.name).toStrictEqual(expectedResponse.payload.name)
      expect(response.sbi).toStrictEqual(expectedResponse.payload.sbi)
      expect(response.cph).toStrictEqual(expectedResponse.payload.cph)
      expect(response.address).toStrictEqual(expectedResponse.payload.address)
      expect(response.email).toStrictEqual(expectedResponse.payload.email)
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
      )
    })

    test('when an invalid response is returned it logs the issue and returns null', async () => {
      const expectedResponse = {
        payload: {
          farmerName: 'David Smith',
          name: 'David\'s Farm',
          sbi: '441111114',
          crn: '4411111144',
          // CPH is not allowed
          cph: '44/333/1112',
          address: 'Some Road, London, MK55 7ES',
          email: 'name@email.com'
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getEligibility(BUSINESS_EMAIL_ADDRESS)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get eligibility failed: {"_original":{"farmerName":"David Smith","name":"David\'s Farm","sbi":"441111114","crn":"4411111144","cph":"44/333/1112","address":"Some Road, London, MK55 7ES","email":"name@email.com"},"details":[{"message":"\\"cph\\" is not allowed","path":["cph"],"type":"object.unknown","context":{"child":"cph","label":"cph","value":"44/333/1112","key":"cph"}}]}')
      expect(response).toBeNull()
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
      )
    })

    test('when Wreck.get returns 400 it logs the issue and returns null', async () => {
      const statusCode = 400
      const statusMessage = 'A valid email address must be specified.'
      const expectedResponse = {
        payload: {
          statusCode,
          error: 'Bad Request',
          message: 'A valid email address must be specified.'
        },
        res: {
          statusCode,
          statusMessage
        }
      }
      const options = {
        json: true
      }
      const businessEmailAddress = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${businessEmailAddress}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getEligibility(businessEmailAddress)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Get eligibility failed: HTTP ${statusCode} (${statusMessage})`)
      expect(response).toBeNull()
    })

    test('when Wreck.get throws an error it logs the error and returns null', async () => {
      const expectedError = new Error('msg')
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/eligibility?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockRejectedValue(expectedError)

      const response = await eligibilityApi.getEligibility(BUSINESS_EMAIL_ADDRESS)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Get eligibility failed: ${expectedError.message}`)
      expect(response).toBeNull()
    })
  })

  describe('getBusinesses', () => {
    test('given a business email address it returns an object containing customer data', async () => {
      const expectedResponse = {
        payload: [{
          farmerName: 'David Smith',
          name: 'David\'s Farm',
          sbi: '441111114',
          crn: '4411111144',
          address: 'Some Road, London, MK55 7ES',
          email: 'name@email.com'
        }],
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getBusinesses(BUSINESS_EMAIL_ADDRESS)

      expect(response).not.toBeNull()
      expect(response.farmerName).toStrictEqual(expectedResponse.payload.farmerName)
      expect(response.name).toStrictEqual(expectedResponse.payload.name)
      expect(response.sbi).toStrictEqual(expectedResponse.payload.sbi)
      expect(response.cph).toStrictEqual(expectedResponse.payload.cph)
      expect(response.address).toStrictEqual(expectedResponse.payload.address)
      expect(response.email).toStrictEqual(expectedResponse.payload.email)
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
      )
    })

    test('when an invalid response is returned it logs the issue and returns null', async () => {
      const expectedResponse = {
        payload: [{
          farmerName: 'David Smith',
          name: 'David\'s Farm',
          sbi: '441111114',
          crn: '4411111144',
          // CPH is not allowed
          cph: '44/333/1112',
          address: 'Some Road, London, MK55 7ES',
          email: 'name@email.com'
        }],
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getBusinesses(BUSINESS_EMAIL_ADDRESS)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Getting businesses failed: ${JSON.stringify({
        businessEmail: BUSINESS_EMAIL_ADDRESS
      })}`, expect.anything())
      expect(response).toBeNull()
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
      )
    })

    test('when Wreck.get returns 400 it logs the issue and returns null', async () => {
      const statusCode = 400
      const statusMessage = 'A valid email address must be specified.'
      const expectedResponse = {
        payload: {
          statusCode,
          error: 'Bad Request',
          message: 'A valid email address must be specified.'
        },
        res: {
          statusCode,
          statusMessage
        }
      }
      const options = {
        json: true
      }
      const businessEmailAddress = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${businessEmailAddress}`,
          options
        )
        .mockResolvedValue(expectedResponse)

      const response = await eligibilityApi.getBusinesses(businessEmailAddress)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Getting businesses failed: ${JSON.stringify({
        businessEmail: businessEmailAddress
      })}`, expect.anything())
      expect(response).toBeNull()
    })

    test('when Wreck.get throws an error it logs the error and returns null', async () => {
      const expectedError = new Error('msg')
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'name@email.com'
      when(Wreck.get)
        .calledWith(
          `${mockEligibilityApiUri}/businesses?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
          options
        )
        .mockRejectedValue(expectedError)

      const response = await eligibilityApi.getBusinesses(BUSINESS_EMAIL_ADDRESS)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Getting businesses failed: ${JSON.stringify({
        businessEmail: BUSINESS_EMAIL_ADDRESS
      })}`, expectedError)
      expect(response).toBeNull()
    })
  })
})
