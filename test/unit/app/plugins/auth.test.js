const { v4: uuid } = require('uuid')
const { farmerApply } = require('../../../../app/constants/user-types')
const { cookie: { ttl }, urlPrefix } = require('../../../../app/config')
const { farmerApplyData: { organisation: organisationKey } } = require('../../../../app/session/keys')

describe('Auth plugin test', () => {
  let getByEmailAndSbi
  let session
  const organisation = { name: 'my-org' }

  beforeAll(async () => {
    jest.resetAllMocks()

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')
    const orgs = require('../../../../app/api-requests/users')
    getByEmailAndSbi = orgs.getByEmailAndSbi
    jest.mock('../../../../app/api-requests/users')
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validEmail = 'dairy@ltd.com'
  const validSbi = '123456789'

  describe('GET requests to /login', () => {
    const url = `${urlPrefix}/login`
    const redirectTo = `${urlPrefix}/org-review`

    async function login () {
      const email = uuid() + validEmail
      const token = uuid()
      const sbi = uuid() + validSbi
      const options = {
        method: 'GET',
        url: `${urlPrefix}/verify-login?email=${email}&token=${token}&sbi=${sbi}`
      }

      await global.__SERVER__.app.magiclinkCache.set(email, [token])
      await global.__SERVER__.app.magiclinkCache.set(token, { email, redirectTo, userType: farmerApply, data: { sbi } })

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
      getByEmailAndSbi.mockResolvedValue(organisation)

      const res = await global.__SERVER__.inject(options)
      const cookieHeader = res.headers['set-cookie']

      const maxAgeOfCookieInSeconds = cookieHeader[0].split('; ').filter(x => x.split('=')[0].toLowerCase() === 'max-age')[0].split('=')[1]

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expect(session.setFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(session.setFarmerApplyData).toHaveBeenCalledWith(res.request, organisationKey, organisation)
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
      expect(session.setFarmerApplyData).toHaveBeenCalledTimes(1)
    })
  })
})
