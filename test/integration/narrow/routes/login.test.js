const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('FarmerApply application login page test', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
  })

  const url = '/login'

  describe(`GET requests to '${url}'`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
    })
  })
})
