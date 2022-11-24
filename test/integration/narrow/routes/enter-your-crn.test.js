const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const { serviceName, urlPrefix } = require('../../../../app/config')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('Farmer apply "Enter your CRN" page', () => {
  let session

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for entering the CRN number', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/crn-enter`
      }
      const EXPECTED_CRN = '0123456789'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'crn')
        .mockReturnValue(EXPECTED_CRN)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-fieldset__legend--l').text().trim()).toEqual('Enter your customer reference number (CRN)')
      expect($('#crn').attr('value')).toEqual(EXPECTED_CRN)
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })

  describe('POST', () => {
    const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      {
        payload: {
          crn: '0123456789',
          confirmCrn: '0123456789'
        }
      }
    ])('when a user provides correct data then returns 302 and redirects to "Enter your email address" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/crn-enter`,
        payload: { crumb, ...testCase.payload },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('enter-your-sbi')

      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'crn',
        testCase.payload.crn
      )
    })

    test.each([
      {
        payload: {},
        expectedError: {
          crn: 'Error: Enter a CRN',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '12345'
        },
        expectedError: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '0123456789'
        },
        expectedError: {
          crn: '',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '0123456789',
          confirmCrn: '9876543210'
        },
        expectedError: {
          crn: '',
          confirmCrn: 'Error: The CRNs do not match'
        }
      }
    ])('when a user provides wrong data then returns 400 and displays an error', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/crn-enter`,
        payload: { crumb, ...testCase.payload },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(400)
      expect($('#crn-error').text().trim()).toEqual(testCase.expectedError.crn)
      expect($('#confirmCrn-error').text().trim()).toEqual(testCase.expectedError.confirmCrn)
    })
  })
})
