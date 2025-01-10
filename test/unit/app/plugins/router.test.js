import { config } from '../../../../app/config/index.js'
import { createServer } from '../../../../app/server.js'

describe('routes plugin test - multi species disabled', () => {
  let server

  beforeAll(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    config.multiSpecies.enabled = false
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('routes included', async () => {
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
      '/apply/cookies',
      '/apply/endemics/check-details',
      '/apply/endemics/declaration',
      '/apply/endemics/numbers',
      '/apply/endemics/reviews',
      '/apply/endemics/timings'
    ])

    await server.stop()
  })
})

describe('routes plugin test - multi species enabled', () => {
  let server

  beforeAll(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    config.multiSpecies.enabled = true
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('routes included', async () => {
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

    await server.stop()
  })
})
