describe('routes plugin test', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('routes included', async () => {
    const createServer = require('../../../../app/server')
    const server = await createServer()
    const routePaths = []
    server.table().forEach(element => {
      routePaths.push(element.path)
    })
    expect(routePaths).toEqual(['/apply', '/healthy', '/healthz', '/apply/accessibility', '/apply/check-answers', '/apply/claim-guidance-for-farmers', '/apply/cookies', '/apply/declaration', '/apply/guidance-for-farmers', '/apply/guidance-for-vet', '/apply/not-eligible', '/apply/org-review', '/apply/privacy-policy', '/apply/recommended-cattle-labs', '/apply/recommended-pig-labs', '/apply/recommended-sheep-labs', '/apply/signin-oidc', '/apply/start', '/apply/terms', '/apply/test-cattle', '/apply/test-pigs', '/apply/test-sheep', '/apply/vet-technical-guidance-cattle', '/apply/vet-technical-guidance-pigs', '/apply/vet-technical-guidance-sheep', '/apply/which-review', '/apply/{species}-eligibility', '/apply/assets/{path*}', '/apply/terms/v1', '/apply/terms/v2', '/apply/terms/v3', '/apply/cookies', '/apply/declaration', '/apply/org-review', '/apply/which-review', '/apply/{species}-eligibility'])
  })
})
