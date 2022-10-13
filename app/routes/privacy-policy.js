const urlPrefix = require('../config/index').urlPrefix
module.exports = {
  method: 'GET',
  path: `${urlPrefix}/privacy-policy`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('privacy-policy')
    }
  }
}
