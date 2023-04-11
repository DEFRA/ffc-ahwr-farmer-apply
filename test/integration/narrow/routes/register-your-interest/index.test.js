const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const getCrumbs = require('../../../../utils/get-crumbs')
// const mockConfig = require('../../../../../app/config')

describe('Farmer apply "Register your interest" page - defra ID disabled', () => {
  let logSpy

  beforeAll(async () => {
    logSpy = jest.spyOn(console, 'log')

    jest.resetAllMocks()
    jest.mock('../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../app/config'),
      authConfig: {
        defraId: {
          enabled: false,
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
      }
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
      expect($('.govuk-heading-l').first().text()).toEqual('Register your interest in a health and welfare review of your livestock')
      expect($('.govuk-heading-body').first().text()).toEqual('To be eligible for a review, you must have one of the following: ')
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
          emailAddress: 'name@example.com'
        }
      },
      {
        payload: {
          emailAddress: 'nAme@eXample.com'
        }
      }
    ])('when any $payload then expect 404 and redirect to "Registration Complete" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest`,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      expect(logSpy).toHaveBeenCalledWith('Defra ID is not enabled', expect.anything())
      expect(res.headers.location).toEqual('register-your-interest')
    })
  })
})

describe('Farmer apply "Register your interest" page - defra ID enabled', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    jest.mock('../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../app/config'),
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
      }
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
      expect($('.govuk-heading-l').first().text()).toEqual('Register your interest in a health and welfare review of your livestock')
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

    test.each([
      {
        payload: {
          emailAddress: 'name@example.com'
        }
      },
      {
        payload: {
          emailAddress: 'nAme@eXample.com'
        }
      }
    ])('when proper $payload then expect 302 and redirect to "Registration Complete" page', async (testCase) => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest`,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('register-your-interest/registration-complete')
    })

    test.each([
      {
        payload: {},
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address'
        }
      },
      {
        payload: {
          emailAddress: ''
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address'
        }
      },
      {
        payload: {
          emailAddress: 1
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your business email address'
        }
      },
      {
        payload: {
          emailAddress: 'name'
        },
        expectedErrors: {
          emailAddress: 'Error: Enter your email address in the correct format, like name@example.com'
        }
      }
    ])('when wrong $payload then expect 400 and $expectedErrors', async (testCase) => {
      // jest.isolateModules(async () => {
      //   const mockOriginalConfig = jest.requireActual('../../../../../app/config')
      //   jest.mock('../../../../../app/config', () => ({
      //     ...mockOriginalConfig,
      //     authConfig: {
      //       defraId: {
      //         enabled: true,
      //         hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
      //         oAuthAuthorisePath: '/oauth2/v2.0/authorize',
      //         policy: 'b2c_1a_signupsigninsfi',
      //         redirectUri: 'http://localhost:3000/apply/signin-oidc',
      //         clientId: 'dummy_client_id',
      //         serviceId: 'dummy_service_id',
      //         scope: 'openid dummy_client_id offline_access'
      //       },
      //       ruralPaymentsAgency: {
      //         hostname: 'dummy-host-name',
      //         getPersonSummaryUrl: 'dummy-get-person-summary-url',
      //         getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
      //         getOrganisationUrl: 'dummy-get-organisation-url'
      //       }
      //     }
      //   }))
      // mockConfig = require('../../../../../app/config')
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest`,
        payload: { crumb, ...testCase.payload },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expect(res.statusCode).toBe(400)
      expect($('#emailAddress-error').text().trim()).toEqual(testCase.expectedErrors.emailAddress)
    })
    // })
  })
})
