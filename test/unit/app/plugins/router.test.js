describe('routes plugin test', () => {
  const registerYourInterestEnabledKey = process.env.REGISTER_YOUR_INTEREST_ENABLED
  beforeEach(() => {
    jest.resetModules()
    delete process.env.REGISTER_YOUR_INTEREST_ENABLED
    process.env = Object.assign(process.env, { REGISTER_YOUR_INTEREST_ENABLED: false })
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env.REGISTER_YOUR_INTEREST_ENABLED = registerYourInterestEnabledKey
  })

  test('register your interest routes not included - feature disabled', async () => {
    const createServer = require('../../../../app/server')
    const server = await createServer()
    const routePaths = []
    server.table().forEach(element => {
      routePaths.push(element.path)
    })
    expect(routePaths).not.toContain('/apply/register-your-interest/index')
    expect(routePaths).not.toContain('/apply/register-your-interest/enter-your-crn')
    expect(routePaths).not.toContain('/apply/register-your-interest/enter-your-sbi')
    expect(routePaths).not.toContain('/apply/register-your-interest/enter-your-email-address')
    expect(routePaths).not.toContain('/apply/register-your-interest/check-your-answers-and-register-your-interest')
    expect(routePaths).not.toContain('/apply/register-your-interest/registration-complete')
  })
})
