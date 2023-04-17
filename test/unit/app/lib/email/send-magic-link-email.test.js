const config = require('../../../../../app/config')
const { farmerApply } = require('../../../../../app/constants/user-types')

const getToken = require('../../../../../app/lib/auth/get-token')
jest.mock('../../../../../app/lib/auth/get-token')

const sendEmail = require('../../../../../app/lib/email/send-email')
jest.mock('../../../../../app/lib/email/send-email')

let cacheData = { }
const requestGetMock = {
  server:
      {
        app:
          {
            magiclinkCache: {
              get: (key) => {
                return cacheData[key]
              },
              set: (key, value) => {
                cacheData[key] = value
              }
            }
          }
      }
}

describe('Send Magic Link test', () => {
  const email = 'test@unit-test.com'
  const sendEmailResponse = true
  const testToken = '644a2a30-7487-4e98-a908-b5ecd82d5225'
  const redirectTo = 'select-your-business'

  beforeEach(() => {
    cacheData = {}
    jest.resetAllMocks()

    sendEmail.mockResolvedValue(sendEmailResponse)
  })

  test('Sends email for farmer apply', async () => {
    jest.isolateModules(async () => {
      const MOCK_SERVICE_URI = 'http://localhost'
      jest.mock('../../../../../app/config', () => {
        const originalModule = jest.requireActual('../../../../../app/config')
        return {
          ...originalModule,
          serviceUri: MOCK_SERVICE_URI
        }
      })
      const token = testToken
      getToken.mockResolvedValue(token)

      const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')
      const response = await sendMagicLinkEmail.sendFarmerApplyLoginMagicLink(requestGetMock, email)

      expect(response).toEqual(sendEmailResponse)
      expect(cacheData[email]).toEqual([token])
      expect(cacheData[token]).toEqual({ email, redirectTo, userType: farmerApply })
      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(config.notifyConfig.emailTemplates.applyLogin, email, {
        personalisation: { magiclink: `${MOCK_SERVICE_URI}/verify-login?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}` },
        reference: token
      })
    })
  })
})
