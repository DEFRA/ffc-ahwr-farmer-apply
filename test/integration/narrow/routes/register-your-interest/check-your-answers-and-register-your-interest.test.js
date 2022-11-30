const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')

const URL = `${urlPrefix}/register-your-interest/check-your-answers-and-register-your-interest`

describe('Farmer apply "Check your answers and register your interest" page', () => {
  let session
  let sendEmail

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()
    session = require('../../../../../app/session')
    jest.mock('../../../../../app/session')
    sendEmail = require('../../../../../app/lib/email/send-email')
    jest.mock('../../../../../app/lib/email/send-email')
  })

  describe('GET', () => {
    test('returns a page allowing for checking answers and registering interest', async () => {
      const options = {
        method: 'GET',
        url: URL
      }
      const EXPECTED_CRN = '0123456789'
      const EXPECTED_SBI = '123456789'
      const EXPECTED_EMAIL_ADDRESS = 'name@example.com'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'crn')
        .mockReturnValue(EXPECTED_CRN)
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'sbi')
        .mockReturnValue(EXPECTED_SBI)
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'emailAddress')
        .mockReturnValue(EXPECTED_EMAIL_ADDRESS)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-heading-l').first().text()).toEqual('Check your answers and register your interest')

      expect($('.govuk-summary-list__row').first().find('.govuk-summary-list__key').text().trim()).toEqual('Customer reference number')
      expect($('.govuk-summary-list__row').first().find('.govuk-summary-list__value').text().trim()).toEqual(EXPECTED_CRN)
      expect($('.govuk-summary-list__row').first().find('.govuk-link').attr('href')).toEqual(`${urlPrefix}/register-your-interest/enter-your-crn`)

      expect($('.govuk-summary-list__row').next().first().find('.govuk-summary-list__key').text().trim()).toEqual('Single business identifier number')
      expect($('.govuk-summary-list__row').next().first().find('.govuk-summary-list__value').text().trim()).toEqual(EXPECTED_SBI)
      expect($('.govuk-summary-list__row').next().first().find('.govuk-link').attr('href')).toEqual(`${urlPrefix}/register-your-interest/enter-your-sbi`)

      expect($('.govuk-summary-list__row').next().next().first().find('.govuk-summary-list__key').text().trim()).toEqual('Email address')
      expect($('.govuk-summary-list__row').next().next().first().find('.govuk-summary-list__value').text().trim()).toEqual(EXPECTED_EMAIL_ADDRESS)
      expect($('.govuk-summary-list__row').next().next().first().find('.govuk-link').attr('href')).toEqual(`${urlPrefix}/register-your-interest/enter-your-email-address`)

      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })

  describe('POST', () => {
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      {
      }
    ])('when post then expect 302 and redirect to "Registration complete" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: URL,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const EXPECTED_EMAIL_ADDRESS = 'name@example.com'

      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'emailAddress')
        .mockReturnValue(EXPECTED_EMAIL_ADDRESS)

      when(sendEmail)
        .calledWith(expect.anything(), EXPECTED_EMAIL_ADDRESS)
        .mockReturnValue(true)

      const res = await global.__SERVER__.inject(options)

      expect(session.clear).toBeCalledTimes(1)
      expect(sendEmail).toBeCalledTimes(1)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('registration-complete')
    })
  })
})
