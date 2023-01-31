const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Farmer apply "Enter your SBI" page', () => {
  let session

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()

    session = require('../../../../../app/session')
    jest.mock('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for entering the single business identifier (SBI) number', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`
      }
      const EXPECTED_SBI = '105000000'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'sbi')
        .mockReturnValue(EXPECTED_SBI)
      const EXPECTED_CONFIRM_SBI = '105000000'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'confirmSbi')
        .mockReturnValue(EXPECTED_CONFIRM_SBI)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-fieldset__legend--l').text().trim()).toEqual('Enter your single business identifier (SBI) number')
      expect($('#sbi').attr('value')).toEqual(EXPECTED_SBI)
      expect($('#confirmSbi').attr('value')).toEqual(EXPECTED_CONFIRM_SBI)
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
          sbi: '105000000',
          confirmSbi: '105000000'
        }
      },
      {
        payload: {
          sbi: '210000000',
          confirmSbi: '210000000'
        }
      }
    ])('when proper $payload then expect 302 and redirect to "Enter your email address" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('enter-your-email-address')
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'sbi',
        Number(testCase.payload.sbi)
      )
      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'confirmSbi',
        Number(testCase.payload.confirmSbi)
      )
    })

    test.each([
      {
        payload: {},
        expectedErrors: {
          sbi: 'Error: Enter your SBI number',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: ''
        },
        expectedErrors: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '99999999'
        },
        expectedErrors: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '9999999999'
        },
        expectedErrors: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: 'ABCDEFGHI'
        },
        expectedErrors: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '104999999'
        },
        expectedErrors: {
          sbi: 'Error: The single business identifier (SBI) number is not recognised',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '210000001'
        },
        expectedErrors: {
          sbi: 'Error: The single business identifier (SBI) number is not recognised',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '105000000'
        },
        expectedErrors: {
          sbi: '',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '105000000',
          confirmSbi: ''
        },
        expectedErrors: {
          sbi: '',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '105000000',
          confirmSbi: 1
        },
        expectedErrors: {
          sbi: '',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '105000000.1'
        },
        expectedErrors: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '105000000',
          confirmSbi: '987654321'
        },
        expectedErrors: {
          sbi: '',
          confirmSbi: 'Error: SBI numbers do not match'
        }
      }
    ])('when wrong $payload then expect 400 and $expectedErrors', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(400)
      expect($('#sbi-error').text().trim()).toEqual(testCase.expectedErrors.sbi)
      expect($('#confirmSbi-error').text().trim()).toEqual(testCase.expectedErrors.confirmSbi)
    })
  })
})
