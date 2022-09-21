const { clear } = require('../session')

module.exports = {
  method: 'GET',
  path: '/offer-rejected',
  options: {
    handler: async (request, h) => {
      clear(request)
      return h.view('offer-rejected')
    }
  }
}
