const { v4: uuid } = require('uuid')
const { farmerApply } = require('../../../../app/constants/user-types')

describe('Auth plugin test', () => {
  describe('GET requests to /login defra ID not enabled', () => {
    let getByEmail
    let session
    let ttl
    let urlPrefix
    let url
    let redirectTo

    const validEmail = 'dairy@ltd.com'
    const organisation = { name: 'my-org' }

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.mock('../../../../app/session')
      session = require('../../../../app/session')
      jest.mock('../../../../app/api-requests/users')
      const orgs = require('../../../../app/api-requests/users')
      getByEmail = orgs.getByEmail
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        authConfig: {
          defraId: {
            enabled: false
          }
        }
      }))
      const config = require('../../../../app/config')

      ttl = config.cookie.ttl
      urlPrefix = config.urlPrefix
      url = `${urlPrefix}/login`
    })

    beforeEach(() => {
      jest.resetAllMocks()
    })

    async function login () {
      const email = uuid() + validEmail
      const token = uuid()
      const options = {
        method: 'GET',
        url: `${urlPrefix}/verify-login?email=${email}&token=${token}`
      }
      redirectTo = `${urlPrefix}/select-your-business?businessEmail=${email}`
      await global.__SERVER__.app.magiclinkCache.set(email, [token])
      await global.__SERVER__.app.magiclinkCache.set(token, { email, redirectTo, userType: farmerApply })

      return global.__SERVER__.inject(options)
    }

    test('when logged in with nothing in session loads data into session', async () => {
      const loginResponse = await login()

      const cookieHeaders = loginResponse.headers['set-cookie'].map(x => x.split('; ')[0]).join('; ')

      const options = {
        method: 'GET',
        url,
        headers: { cookie: cookieHeaders }
      }
      getByEmail.mockResolvedValue(organisation)

      const res = await global.__SERVER__.inject(options)
      const cookieHeader = res.headers['set-cookie']

      const maxAgeOfCookieInSeconds = cookieHeader[0].split('; ').filter(x => x.split('=')[0].toLowerCase() === 'max-age')[0].split('=')[1]

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expect(session.setFarmerApplyData).not.toHaveBeenCalled()
      expect(parseInt(maxAgeOfCookieInSeconds, 10) * 1000).toEqual(ttl)
    })

    test('when logged in with data in session does not set session data', async () => {
      const loginResponse = await login()

      const cookieHeaders = loginResponse.headers['set-cookie'].map(x => x.split('; ')[0]).join('; ')

      const options = {
        method: 'GET',
        url,
        headers: { cookie: cookieHeaders }
      }
      session.getFarmerApplyData.mockReturnValue({ application: {} })

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expect(session.setFarmerApplyData).not.toHaveBeenCalled()
    })
  })

  describe('Aceessing secured route without auth cookie redirects to DEFRA ID login', () => {
    let urlPrefix
    let url
    let authMock

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('../../../../app/session')
      jest.mock('../../../../app/auth')
      authMock = require('../../../../app/auth')
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        authConfig: {
          defraId: {
            enabled: true
          }
        }
      }))
      const config = require('../../../../app/config')
      urlPrefix = config.urlPrefix
      url = `${urlPrefix}/org-review`
    })

    test('when not logged in redirects to defra id', async () => {
      const defraIdLogin = 'https://azdcuspoc5.b2clogin.com/azdcuspoc5.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUPSIGNINSFI&client_id=83d2b160-74ce-4356-9709-3f8da7868e35&nonce=7a02721c-b036-41c5-9e09-323c1dbab640&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapply%2Fsignin-oidc&scope=openid+83d2b160-74ce-4356-9709-3f8da7868e35+offline_access&response_type=code&serviceId=2a672ee6-7750-ed11-bba3-000d3adf7047&state=1ac3d6d1-3ff5-4331-82d7-41c15c7515a3&forceReselection=true&code_challenge=HO7x7I2iNdO2xpZJXcsyHp2ls0aT6t5dRztv04WdxrU&code_challenge_method=S256'
      const options = {
        method: 'GET',
        url
      }

      authMock.getAuthenticationUrl.mockReturnValueOnce(defraIdLogin)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(defraIdLogin)
    })
  })
})
