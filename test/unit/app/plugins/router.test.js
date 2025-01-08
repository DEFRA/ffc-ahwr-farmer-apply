import { createServer } from '../../../../app/server.js'

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
      '/apply/cookies',
      '/apply/privacy-policy',
      '/apply/signin-oidc',
      '/apply/start',
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
      '/apply/cookies',
      '/apply/privacy-policy',
      '/apply/signin-oidc',
      '/apply/start',
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
