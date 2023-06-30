const { when, resetAllWhenMocks } = require('jest-when')
const Wreck = require('@hapi/wreck')
const mockConfig = require('../../../../app/config')

jest.mock('@hapi/wreck')

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

  describe('checkWaitingList', () => {
    test('given a business email address it returns an object containing registration data', async () => {
      const expectedResponse = {
        payload: {
          alreadyRegistered: false,
          accessGranted: false
        },
        res: {
          statusCode: 200
        }
      }
      const options = {
        json: true
      }
      const BUSINESS_EMAIL_ADDRESS = 'test@test.com'
      when(Wreck.get)
        .calledWith(
    `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
    options
        )
        .mockResolvedValue(expectedResponse)
      const response = await eligibilityApi.checkWaitingList(BUSINESS_EMAIL_ADDRESS)

      expect(response).not.toBeNull()
      expect(response).toBe(expectedResponse.payload)
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
      `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
      options
      )
    })

    test('when a non 200 response is returned from the waiting list api and error is thrown', async () => {
      const options = {
        json: true
      }
      const expectedResponse = {
        res: {
          statusCode: 400,
          statusMessage: 'some problem'
        }
      }
      const BUSINESS_EMAIL_ADDRESS = 'test@test.com'
      when(Wreck.get)
        .calledWith(
        `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
        options
        )
        .mockResolvedValueOnce(expectedResponse)

      await expect(eligibilityApi.checkWaitingList(BUSINESS_EMAIL_ADDRESS)).rejects.toThrow('HTTP 400 (some problem)')
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
      `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
      options
      )
    })

    test('when an undefined response is returned from the waiting list api and error is thrown', async () => {
      const options = {
        json: true
      }
      const expectedResponse = {
        res: undefined
      }
      const BUSINESS_EMAIL_ADDRESS = 'test@test.com'
      when(Wreck.get)
        .calledWith(
        `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
        options
        )
        .mockResolvedValueOnce(expectedResponse)

      await expect(eligibilityApi.checkWaitingList(BUSINESS_EMAIL_ADDRESS)).rejects.toThrow(Error)
      expect(Wreck.get).toHaveBeenCalledTimes(1)
      expect(Wreck.get).toHaveBeenCalledWith(
      `${mockEligibilityApiUri}/waiting-list?emailAddress=${BUSINESS_EMAIL_ADDRESS}`,
      options
      )
    })
  })
})
