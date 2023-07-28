const cheerio = require('cheerio')
const { when, resetAllWhenMocks } = require('jest-when')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const getCrumbs = require('../../../../utils/get-crumbs')
const mockConfig = require('../../../../../app/config')

jest.mock('ffc-messaging')

describe('Farmer apply "Enter your business email address" page', () => {
  describe('ROI enabled', () => {
    let checkWaitingList
    let sendEmail
    let sendDefraIdRegisterYourInterestMessage

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.mock('../../../../../app/config', () => ({
        ...mockConfig,
        authConfig: {
          defraId: {
            enabled: true,
            hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
            oAuthAuthorisePath: '/oauth2/v2.0/authorize',
            policy: 'b2c_1a_signupsigninsfi',
            redirectUri: 'http://localhost:3000/apply/signin-oidc',
            clientId: 'dummy_client_id',
            serviceId: 'dummy_service_id',
            scope: 'openid dummy_client_id offline_access'
          },
          ruralPaymentsAgency: {
            hostname: 'dummy-host-name',
            getPersonSummaryUrl: 'dummy-get-person-summary-url',
            getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
            getOrganisationUrl: 'dummy-get-organisation-url'
          }
        },
        notifyConfig: {
          emailTemplates: {
            accessGranted: 'accessGranted',
            accessNotGranted: 'accessNotGranted',
            registerYourInterest: 'registerYourInterest'
          }
        },
        serviceUri: 'http://localhost:3000/apply',
        registerYourInterest: {
          enabled: true
        }
      }))
      checkWaitingList = require('../../../../../app/api-requests/eligibility-api').checkWaitingList
      jest.mock('../../../../../app/api-requests/eligibility-api', () => ({
        checkWaitingList: jest.fn()
      }))
      sendEmail = require('../../../../../app/lib//email/send-email')
      jest.mock('../../../../../app/lib//email/send-email', () => jest.fn())
      sendDefraIdRegisterYourInterestMessage = require('../../../../../app/messaging/register-your-interest').sendDefraIdRegisterYourInterestMessage
      jest.mock('../../../../../app/messaging/register-your-interest', () => ({
        sendDefraIdRegisterYourInterestMessage: jest.fn()
      }))
    })

    describe('GET', () => {
      test('returns a page allowing for registering interest', async () => {
        const options = {
          method: 'GET',
          url: `${urlPrefix}/register-your-interest`
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(200)
        const $ = cheerio.load(res.payload)
        expect($('.govuk-heading-l').first().text()).toEqual('Register your interest in an annual health and welfare review of your livestock')
        expect($('.govuk-heading-body').first().text()).toEqual('To register your interest in applying for a review, enter the main business email address of the business registering. This is the main business email address linked to the business in your Rural Payments account.')
        expect($('title').text()).toEqual(serviceName)
        expectPhaseBanner.ok($)
      })
    })

    describe('POST', () => {
      let crumb

      beforeEach(async () => {
        crumb = await getCrumbs(global.__SERVER__)
      })

      afterEach(async () => {
        resetAllWhenMocks()
        jest.resetAllMocks()
      })

      test.each([
        {
          payload: {
            emailAddress: 'name@example.com'
          },
          alreadyRegistered: false,
          accessGranted: false,
          expectedEmailTemplate: 'registerYourInterest'
        },
        {
          payload: {
            emailAddress: 'name@example.com'
          },
          alreadyRegistered: true,
          accessGranted: false,
          expectedEmailTemplate: 'accessNotGranted'
        },
        {
          payload: {
            emailAddress: 'name@example.com'
          },
          alreadyRegistered: true,
          accessGranted: true,
          expectedEmailTemplate: 'accessGranted'
        }
      ])('when proper $payload then expect 302 and redirect to "Registration Complete" page', async (testCase) => {
        const options = {
          method: 'POST',
          url: `${urlPrefix}/register-your-interest`,
          payload: { crumb, ...testCase.payload },
          headers: { cookie: `crumb=${crumb}` }
        }

        when(checkWaitingList)
          .calledWith(testCase.payload.emailAddress)
          .mockResolvedValue({ alreadyRegistered: testCase.alreadyRegistered, accessGranted: testCase.accessGranted })

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual('register-your-interest/registration-complete')
        expect(sendEmail).toHaveBeenCalledTimes(1)

        if (testCase.expectedEmailTemplate === 'registerYourInterest') {
          expect(sendEmail).toHaveBeenCalledWith(
            testCase.expectedEmailTemplate,
            testCase.payload.emailAddress
          )
          expect(sendDefraIdRegisterYourInterestMessage).toHaveBeenCalledTimes(1)
          expect(sendDefraIdRegisterYourInterestMessage).toHaveBeenCalledWith(
            testCase.payload.emailAddress
          )
        } else {
          expect(sendEmail).toHaveBeenCalledWith(
            testCase.expectedEmailTemplate,
            testCase.payload.emailAddress,
            {
              personalisation: {
                applyGuidanceUrl: 'http://localhost:3000/apply',
                applyVetGuidanceUrl: 'http://localhost:3000/apply/guidance-for-vet'
              }
            }
          )
          expect(sendDefraIdRegisterYourInterestMessage).toHaveBeenCalledTimes(0)
        }
      })

      test('internal server error when registration of interest fails', async () => {
        const options = {
          method: 'POST',
          url: `${urlPrefix}/register-your-interest`,
          payload: { crumb, emailAddress: 'name@example.com' },
          headers: { cookie: `crumb=${crumb}` }
        }

        when(checkWaitingList)
          .calledWith(options.payload.emailAddress)
          .mockRejectedValueOnce(new Error('some error'))

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(500)
      })

      test.each([
        {
          payload: {},
          expectedErrors: {
            emailAddress: 'Enter your business email address'
          }
        },
        {
          payload: {
            emailAddress: ''
          },
          expectedErrors: {
            emailAddress: 'Enter your business email address'
          }
        },
        {
          payload: {
            emailAddress: 1
          },
          expectedErrors: {
            emailAddress: 'Enter your business email address'
          }
        },
        {
          payload: {
            emailAddress: 'name'
          },
          expectedErrors: {
            emailAddress: 'Enter your email address in the correct format, like name@example.com'
          }
        },
        {
          payload: {
            emailAddress: 'a'.repeat(65) + '@example.com'
          },
          expectedErrors: {
            emailAddress: 'Enter your email address in the correct format, like name@example.com'
          }
        },
        {
          payload: {
            emailAddress: 'name@' + 'a'.repeat(256) + '.com'
          },
          expectedErrors: {
            emailAddress: 'Enter your email address in the correct format, like name@example.com'
          }
        },
        {
          payload: {
            emailAddress: 'name@example.c'
          },
          expectedErrors: {
            emailAddress: 'Enter your email address in the correct format, like name@example.com'
          }
        },
        {
          payload: {
            emailAddress: 'business£5@email.com'
          },
          expectedErrors: {
            emailAddress: 'Enter your email address in the correct format, like name@example.com'
          }
        }
      ])('when wrong $payload then expect 400 and $expectedErrors', async (testCase) => {
        const options = {
          method: 'POST',
          url: `${urlPrefix}/register-your-interest`,
          payload: { crumb, ...testCase.payload },
          headers: { cookie: `crumb=${crumb}` }
        }

        const res = await global.__SERVER__.inject(options)
        const $ = cheerio.load(res.payload)

        expect(res.statusCode).toBe(400)
        expect($('div.govuk-error-summary ul.govuk-list li a').attr('href')).toEqual('#emailAddress')
        expect($('div.govuk-error-summary ul.govuk-list li a').text().trim()).toEqual(testCase.expectedErrors.emailAddress)
        expect($('p.govuk-error-message').text().trim()).toEqual(testCase.expectedErrors.emailAddress)
      })
    })
  })

  describe('ROI disabled', () => {
    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('../../../../../app/config', () => ({
        ...mockConfig,
        serviceUri: 'http://localhost:3000/apply',
        registerYourInterest: {
          enabled: false
        }
      }))
    })

    describe('GET', () => {
      test('returns a the landing page', async () => {
        const options = {
          method: 'GET',
          url: `${urlPrefix}/register-your-interest`
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual('/apply')
      })
    })
  })
})
