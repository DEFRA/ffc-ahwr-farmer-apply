const { v4: uuid } = require('uuid')
const { farmerApply } = require('../../../../app/constants/user-types')
const { farmerApplyData: { organisation: organisationKey } } = require('../../../../app/session/keys')

describe('Auth plugin test', () => {
  describe('GET requests to /login', () => {
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

  describe('GET requests to /login with business selected true', () => {
    let getByEmail
    let session
    let urlPrefix
    let url
    let redirectTo

    const validEmail = 'dairy@ltd.com'
    const organisation = { name: 'my-org' }

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()
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

      urlPrefix = config.urlPrefix
      url = `${urlPrefix}/login`
      redirectTo = `${urlPrefix}/org-review`
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

      await global.__SERVER__.app.magiclinkCache.set(email, [token])
      await global.__SERVER__.app.magiclinkCache.set(token, { email, redirectTo, userType: farmerApply })

      return global.__SERVER__.inject(options)
    }

    test('when select business on session not set', async () => {
      const loginResponse = await login()

      const cookieHeaders = loginResponse.headers['set-cookie'].map(x => x.split('; ')[0]).join('; ')

      const options = {
        method: 'GET',
        url,
        headers: { cookie: cookieHeaders }
      }
      getByEmail.mockResolvedValue(organisation)

      const res = await global.__SERVER__.inject(options)
      expect(session.setFarmerApplyData).not.toHaveBeenCalledWith(res.request, organisationKey, organisation)
    })
  })
})
