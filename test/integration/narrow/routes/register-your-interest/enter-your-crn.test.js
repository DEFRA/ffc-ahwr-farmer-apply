const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Farmer apply "Enter your CRN" page', () => {
  let session

  const URL = `${urlPrefix}/register-your-interest/enter-your-crn`

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()

    session = require('../../../../../app/session')
    jest.mock('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for entering the CRN number', async () => {
      const options = {
        method: 'GET',
        url: URL
      }
      const EXPECTED_CRN = '1100000000'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'crn')
        .mockReturnValue(EXPECTED_CRN)
      const EXPECTED_CONFIRM_CRN = '1100000000'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'confirmCrn')
        .mockReturnValue(EXPECTED_CONFIRM_CRN)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-fieldset__legend--l').text().trim()).toEqual('Enter your customer reference number (CRN)')
      expect($('#crn').attr('value')).toEqual(EXPECTED_CRN)
      expect($('#confirmCrn').attr('value')).toEqual(EXPECTED_CONFIRM_CRN)
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
          crn: '1100000000',
          confirmCrn: '1100000000'
        }
      }
    ])('when proper $payload then expect 302 and redirect to "Enter your email address" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: URL,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('enter-your-sbi')
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'crn',
        Number(testCase.payload.crn)
      )
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'confirmCrn',
        Number(testCase.payload.confirmCrn)
      )
    })

    test.each([
      {
        payload: {},
        expectedErrors: {
          crn: 'Error: Enter a CRN',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: ''
        },
        expectedErrors: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '999999999'
        },
        expectedErrors: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '10000000000'
        },
        expectedErrors: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: 'ABCDEFGHIJ'
        },
        expectedErrors: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1099999999'
        },
        expectedErrors: {
          crn: 'Error: The CRN is out of range',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1110000001'
        },
        expectedErrors: {
          crn: 'Error: The CRN is out of range',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1100000000'
        },
        expectedErrors: {
          crn: '',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1100000000',
          confirmCrn: ''
        },
        expectedErrors: {
          crn: '',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1100000000',
          confirmCrn: 1
        },
        expectedErrors: {
          crn: '',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1100000000.1'
        },
        expectedErrors: {
          crn: 'Error: Enter a CRN that has 10 digits',
          confirmCrn: 'Error: Confirm your CRN'
        }
      },
      {
        payload: {
          crn: '1100000000',
          confirmCrn: '9876543210'
        },
        expectedErrors: {
          crn: '',
          confirmCrn: 'Error: The CRNs do not match'
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
      expect($('#crn-error').text().trim()).toEqual(testCase.expectedErrors.crn)
      expect($('#confirmCrn-error').text().trim()).toEqual(testCase.expectedErrors.confirmCrn)
    })
  })
})
