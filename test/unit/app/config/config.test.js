test('uses defaults', () => {
  jest.resetModules()
  delete process.env.REDIS_HOSTNAME
  delete process.env.REDIS_PORT
  delete process.env.PORT
  delete process.env.URL_PREFIX

  const config = require('../../../../app/config')

  expect(config.cache.options.host)
    .toBe('redis-hostname.default')
  expect(config.cache.options.port)
    .toBe(6379)
  expect(config.port)
    .toBe(3000)
  expect(config.urlPrefix)
    .toBe('/apply')
})

test('throws an error for invalid config', () => {
  jest.resetModules()
  delete process.env.COOKIE_PASSWORD

  expect(() => require('../../../../app/config'))
    .toThrow('The server config is invalid. "cookie.password" is required. "cookiePolicy.password" is required')
})
