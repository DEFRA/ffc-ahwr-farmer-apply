const cheerio = require('cheerio')
const sessionMock = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('FarmerApply defra ID redirection test', () => {
  const config = require('../../../../../app/config')
  const urlPrefix = config.urlPrefix
  const url = `${urlPrefix}/signin-oidc`

  beforeEach(async () => {
    jest.resetAllMocks()
    jest.mock('../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../app/config'),
      authConfig: {
        defraId: {
          enabled: true
        }
      }
    }))
  })

  describe(`GET requests to '${url}'`, () => {
    test.each([
      { code: '', state: '' },
      { code: undefined, state: undefined },
      { code: null, state: null },
      { code: 'sads', state: undefined },
      { code: undefined, state: 'sdsdsds' },
      { code: null, state: '3433' },
      { code: '34334343', state: null },
      { code: '4q32423432', state: '' },
      { code: '', state: 'some state' }
    ])('returns 400 and login failed view when missing required query parameters - %p', async ({ code, state }) => {
      const baseUrl = `${url}?code=${code}&state=${state}`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when state mismatch', async () => {
      const baseUrl = `${url}?code=432432&state=wrongstate`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      sessionMock.getToken.mockReturnValueOnce('some state')

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
      expect(sessionMock.getToken).toBeCalledTimes(1)
    })

    test('returns 302 and redirected to org view when authenticate successful', async () => {
      const baseUrl = `${url}?code=432432&state=1234`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      sessionMock.getToken.mockReturnValueOnce('1234')

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/org-review')
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(1)
    })
  })
})
