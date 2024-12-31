describe('routes plugin test', () => {
  jest.mock('../../../../app/config', () => ({
    ...jest.requireActual('../../../../app/config'),
    endemics: {
      enabled: false
    }
  }))

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('routes included', async () => {
    const createServer = require('../../../../app/server')
    const server = await createServer()
    const routePaths = []
    server.table().forEach((element) => {
      routePaths.push(element.path)
    })
    expect(routePaths).toEqual([
      '/apply',
      '/healthy',
      '/healthz',
      '/apply/accessibility',
      '/apply/claim-guidance-for-farmers',
      '/apply/cookies',
      '/apply/guidance-for-farmers',
      '/apply/guidance-for-vet',
      '/apply/privacy-policy',
      '/apply/recommended-cattle-labs',
      '/apply/recommended-pig-labs',
      '/apply/recommended-sheep-labs',
      '/apply/signin-oidc',
      '/apply/start',
      '/apply/test-cattle',
      '/apply/test-pigs',
      '/apply/test-sheep',
      '/apply/vet-technical-guidance-cattle',
      '/apply/vet-technical-guidance-pigs',
      '/apply/vet-technical-guidance-sheep',
      '/apply/assets/{path*}',
      '/apply/cookies'
    ])
  })

  test('routes included - endemics enabled', async () => {
    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      endemics: {
        enabled: true
      }
    }))

    const createServer = require('../../../../app/server')
    const server = await createServer()
    const routePaths = []
    server.table().forEach((element) => {
      routePaths.push(element.path)
    })
    expect(routePaths).toEqual([
      '/apply',
      '/healthy',
      '/healthz',
      '/apply/accessibility',
      '/apply/claim-guidance-for-farmers',
      '/apply/cookies',
      '/apply/guidance-for-farmers',
      '/apply/guidance-for-vet',
      '/apply/privacy-policy',
      '/apply/recommended-cattle-labs',
      '/apply/recommended-pig-labs',
      '/apply/recommended-sheep-labs',
      '/apply/signin-oidc',
      '/apply/start',
      '/apply/test-cattle',
      '/apply/test-pigs',
      '/apply/test-sheep',
      '/apply/vet-technical-guidance-cattle',
      '/apply/vet-technical-guidance-pigs',
      '/apply/vet-technical-guidance-sheep',
      '/apply/assets/{path*}',
      '/apply/endemics/check-details',
      '/apply/endemics/declaration',
      '/apply/endemics/numbers',
      '/apply/endemics/reviews',
      '/apply/endemics/start',
      '/apply/endemics/timings',
      '/apply/endemics/you-can-claim-multiple',
      '/apply/cookies',
      '/apply/endemics/check-details',
      '/apply/endemics/declaration',
      '/apply/endemics/numbers',
      '/apply/endemics/reviews',
      '/apply/endemics/timings',
      '/apply/endemics/you-can-claim-multiple'
    ])
  })
})
