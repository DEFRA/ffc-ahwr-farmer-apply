const { when, resetAllWhenMocks } = require('jest-when')
const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const { serviceName, urlPrefix } = require('../../../../app/config')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('Farmer apply "Enter your SBI" page', () => {
  let session

  beforeAll(async () => {
    jest.resetAllMocks()
    resetAllWhenMocks()

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for entering the single business identifier (SBI) number', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`
      }
      const EXPECTED_SBI = '123456789'
      when(session.getRegisterYourInterestData)
        .calledWith(expect.anything(), 'sbi')
        .mockReturnValue(EXPECTED_SBI)

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(200)
      expect($('.govuk-fieldset__legend--l').text().trim()).toEqual('Enter the single business identifier (SBI) number')
      expect($('#sbi').attr('value')).toEqual(EXPECTED_SBI)
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
          sbi: '123456789',
          confirmSbi: '123456789'
        }
      }
    ])('when a user provides correct data then returns 302 and redirects to "Enter your email address" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`,
        payload: { crumb, ...testCase.payload },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('enter-your-email')

      expect(session.setRegisterYourInterestData).toHaveBeenCalledWith(
        expect.anything(),
        'sbi',
        testCase.payload.sbi
      )
    })

    test.each([
      {
        payload: {},
        expectedError: {
          sbi: 'Error: Enter your SBI number',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '12345'
        },
        expectedError: {
          sbi: 'Error: Enter an SBI number that has 9 digits',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '123456789'
        },
        expectedError: {
          sbi: '',
          confirmSbi: 'Error: Confirm your SBI number'
        }
      },
      {
        payload: {
          sbi: '123456789',
          confirmSbi: '987654321'
        },
        expectedError: {
          sbi: '',
          confirmSbi: 'Error: SBI numbers do not match'
        }
      }
    ])('when a user provides wrong data then returns 400 and displays an error', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/enter-your-sbi`,
        payload: { crumb, ...testCase.payload },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(400)
      expect($('#sbi-error').text().trim()).toEqual(testCase.expectedError.sbi)
      expect($('#confirmSbi-error').text().trim()).toEqual(testCase.expectedError.confirmSbi)
    })
  })
})
