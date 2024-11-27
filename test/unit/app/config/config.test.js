test('throws an error for invalid config', () => {
  jest.resetModules()
  delete process.env.COOKIE_PASSWORD

  expect(() => require('../../../../app/config'))
    .toThrow('The server config is invalid. "cookie.password" is required. "cookiePolicy.password" is required')
})
