const urlPrefix = require('../config/index').urlPrefix

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/signout`,
  options: {
    handler: async (request, h) => {
      return h.view('login', { hintText:"Thank you for using service" })
    }
  }
}]