const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Farmer apply "Enter your business email address" page', () => {
  let session

  const URL = `${urlPrefix}/register-your-interest/enter-your-email-address`

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()

    session = require('../../../../../app/session')
    jest.mock('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for entering the email address', async () => {
      const options = {
        method: 'GET',
        url: URL
      }
      const EXPECTED_EMAIL_ADDRESS = 'expected@email.com'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'emailAddress')
        .mockReturnValue(EXPECTED_EMAIL_ADDRESS)
      const EXPECTED_CONFIRM_EMAIL_ADDRESS = 'confirmed@email.com'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'confirmEmailAddress')
        .mockReturnValue(EXPECTED_CONFIRM_EMAIL_ADDRESS)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-fieldset__legend--l').text().trim()).toEqual('Enter your business email address')
      expect($('#emailAddress').attr('value')).toEqual(EXPECTED_EMAIL_ADDRESS)
      expect($('#confirmEmailAddress').attr('value')).toEqual(EXPECTED_CONFIRM_EMAIL_ADDRESS)
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
        payload: {
          emailAddress: 'name@example.com',
          confirmEmailAddress: 'name@example.com'
        }
      },
      {
        payload: {
          emailAddress: 'name@example.com',
          confirmEmailAddress: 'Name@example.com'
        }
      }
    ])('when proper $payload then expect 302 and redirect to "Check your answers and register your interest" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: URL,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('check-your-answers-and-register-your-interest')
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'emailAddress',
        testCase.payload.emailAddress
      )
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'confirmEmailAddress',
        testCase.payload.confirmEmailAddress.toLowerCase()
      )
    })

    test.each([
      {
        payload: {},
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: ''
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 1
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 'name'
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your email address in the correct format, like name@example.com',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 'name@example.com'
        },
        expectedErrors: {
          emailAddress: '',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 'name@example.com',
          confirmEmailAddress: ''
        },
        expectedErrors: {
          emailAddress: '',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 'name@example.com',
          confirmEmailAddress: 1
        },
        expectedErrors: {
          emailAddress: '',
          confirmEmailAddress: 'Error: Confirm your email address'
        }
      },
      {
        payload: {
          emailAddress: 'name@example.com',
          confirmEmailAddress: 'other@example.com'
        },
        expectedErrors: {
          emailAddress: '',
          confirmEmailAddress: 'Error: Email addresses entered do not match'
        }
      }
    ])('when wrong $payload then expect 400 and $expectedErrors', async (testCase) => {
      const options = {
        method: 'POST',
        url: URL,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(400)
      expect($('#emailAddress-error').text().trim()).toEqual(testCase.expectedErrors.emailAddress)
      expect($('#confirmEmailAddress-error').text().trim()).toEqual(testCase.expectedErrors.confirmEmailAddress)
    })
  })
})
