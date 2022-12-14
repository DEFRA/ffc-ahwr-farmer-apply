const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')
const { serviceUri } = require('../../../../../app/config')
const { applyLogin } = require('../../../../../app/config').notifyConfig.emailTemplates
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

  beforeEach(() => {
    cacheData = {}
    jest.resetAllMocks()

    sendEmail.mockResolvedValue(sendEmailResponse)
  })

  test('sends email for farmer apply', async () => {
    const token = testToken
    getToken.mockResolvedValue(token)

    const response = await sendMagicLinkEmail.sendFarmerApplyLoginMagicLink(requestGetMock, email)

    expect(response).toEqual(sendEmailResponse)
    expect(cacheData[email]).toEqual([token])
    expect(cacheData[token]).toEqual({ email, redirectTo: 'org-review', userType: farmerApply })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(applyLogin, email, {
      personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
      reference: token
    })
  })
})
