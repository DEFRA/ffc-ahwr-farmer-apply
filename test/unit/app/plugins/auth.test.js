describe('Auth plugin test', () => {
  describe('Aceessing secured route without auth cookie redirects to DEFRA ID login', () => {
    let urlPrefix
    let url
    let authMock

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('../../../../app/session')
      jest.mock('../../../../app/auth')
      authMock = require('../../../../app/auth')
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        authConfig: {
          defraId: {
            enabled: true
          },
          ruralPaymentsAgency: {
            hostname: 'dummy-host-name'
          }
        }
      }))
      const config = require('../../../../app/config')
      urlPrefix = config.urlPrefix
      url = `${urlPrefix}/org-review`
    })

    test('when not logged in redirects to defra id', async () => {
      const defraIdLogin = 'https://azdcuspoc5.b2clogin.com/azdcuspoc5.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUPSIGNINSFI&client_id=83d2b160-74ce-4356-9709-3f8da7868e35&nonce=7a02721c-b036-41c5-9e09-323c1dbab640&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapply%2Fsignin-oidc&scope=openid+83d2b160-74ce-4356-9709-3f8da7868e35+offline_access&response_type=code&serviceId=2a672ee6-7750-ed11-bba3-000d3adf7047&state=1ac3d6d1-3ff5-4331-82d7-41c15c7515a3&forceReselection=true&code_challenge=HO7x7I2iNdO2xpZJXcsyHp2ls0aT6t5dRztv04WdxrU&code_challenge_method=S256'
      const options = {
        method: 'GET',
        url
      }

      authMock.requestAuthorizationCodeUrl.mockReturnValueOnce(defraIdLogin)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(defraIdLogin)
    })
  })
})
