const urlPrefix = require('../config/index').urlPrefix
module.exports = {
  method: 'GET',
  path: `${urlPrefix}/terms`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('terms')
    }
  }
}
