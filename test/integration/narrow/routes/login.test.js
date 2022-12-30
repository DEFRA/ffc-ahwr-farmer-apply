const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const getCrumbs = require('../../../utils/get-crumbs')
const expectLoginPage = require('../../../utils/login-page-expect')
const pageExpects = require('../../../utils/page-expects')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceUri, urlPrefix } = require('../../../../app/config')
const { applyLogin } = require('../../../../app/config').notifyConfig.emailTemplates
const { farmerApply } = require('../../../../app/constants/user-types')
const uuidRegex = require('../../../../app/config/uuid-regex')

jest.mock('ffc-ahwr-event-publisher')

describe('FarmerApply application login page test', () => {
  let sendEmail
  let getByEmailAndSbi
  const org = { name: 'my-org' }

  beforeAll(async () => {
    jest.resetAllMocks()

    sendEmail = require('../../../../app/lib/email/send-email')
    jest.mock('../../../../app/lib/email/send-email')
    const orgs = require('../../../../app/api-requests/users')
    getByEmailAndSbi = orgs.getByEmailAndSbi
    jest.mock('../../../../app/api-requests/users')
  })

  const url = `${urlPrefix}/login`
  const validEmail = 'dairy@ltd.com'
  const validSbi = '123456789'

  describe(`GET requests to '${url}'`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($, 'apply')
    })

    test('route when already logged in redirects to org-review', async () => {
      const options = {
        auth: { credentials: { email: validEmail }, strategy: 'cookie', isAuthenticated: true },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`${urlPrefix}/org-review`)
    })
  })

  describe(`POST requests to '${url}' route`, () => {
    test.each([
      { email: 'not-an-email', sbi: validSbi, errorMessage: 'Enter an email address in the correct format, like name@example.com' },
      { email: '', sbi: validSbi, errorMessage: 'Enter an email address' },
      { email: null, sbi: validSbi, errorMessage: 'Enter an email address' },
      { email: undefined, sbi: validSbi, errorMessage: 'Enter an email address' },
      { email: 'missing@email.com', sbi: validSbi, errorMessage: 'No user found with email address "missing@email.com" and sbi "123456789"' }
    ])('returns 400 when request contains incorrect email - %p', async ({ email, errorMessage, sbi }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email, sbi },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($, 'apply')
      pageExpects.errors($, errorMessage)
    })

    test.each([
      { crumb: '' },
      { crumb: undefined }
    ])('returns 403 when request does not contain crumb - $crumb', async ({ crumb }) => {
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
    })

    test.each([
      { desc: 'with known email for the first time redirects to email sent page with form filled with email and adds token to cache with redirectTo for farmer', existingToken: false },
      { desc: 'with known email with an existing token redirects to email sent page and adds token to cache with redirectTo for farmer', existingToken: true }
    ])('$desc', async ({ existingToken }) => {
      getByEmailAndSbi.mockResolvedValue(org)
      sendEmail.mockResolvedValue(true)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail, sbi: validSbi },
        headers: { cookie: `crumb=${crumb}` }
      }
      let token
      if (existingToken) {
        token = uuid()
        await global.__SERVER__.app.magiclinkCache.set(validEmail, [token])
      }

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheSetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'set')

      const res = await global.__SERVER__.inject(options)

      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenCalledWith(validEmail)
      expect(cacheSetSpy).toHaveBeenCalledTimes(2)
      if (existingToken) {
        expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [token, expect.stringMatching(new RegExp(uuidRegex))])
      } else {
        expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [expect.stringMatching(new RegExp(uuidRegex))])
      }
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(uuidRegex)), { email: validEmail, redirectTo: 'org-review', userType: farmerApply, data: { sbi: validSbi} })
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Check your email')
      expect($('#email').text()).toEqual(validEmail)
      expect($('#activity').text()).toEqual('The email includes a link to apply for a review. This link will expire in 15 minutes.')

      cacheGetSpy.mockRestore()
      cacheSetSpy.mockRestore()
    })

    test.each([
      { email: validEmail, sbi: validSbi },
      { email: `  ${validEmail}  `, sbi: validSbi }
    ])('with known email sends email (email = $email)', async ({ email, sbi }) => {
      getByEmailAndSbi.mockResolvedValue(org)
      sendEmail.mockResolvedValue(true)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email, sbi },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sendEmail).toHaveBeenCalledWith(
        applyLogin,
        validEmail,
        expect.objectContaining(
          { personalisation: { magiclink: expect.stringMatching(new RegExp(`${serviceUri}/verify-login\\?token=${uuidRegex}&email=${validEmail}&sbi=${validSbi}`)) }, reference: expect.stringMatching(new RegExp(uuidRegex)) })
      )
    })

    test('with known email returns error when problem sending email', async () => {
      getByEmailAndSbi.mockResolvedValue(org)
      sendEmail.mockResolvedValue(false)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail, sbi: validSbi },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(500)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })
  })
})
