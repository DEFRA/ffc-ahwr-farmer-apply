const config = require('../config')

module.exports = {
  method: 'GET',
  path: `${config.urlPrefix}/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      // old world apply is no longer active, redirect user to new world start
      // it's not actually possible to navigate directly to this page anyway anymore, except
      // if the user decided to type it in url themselves, or had a bookmark saved here
      return h.redirect(`${config.urlPrefix}/endemics/start`)
    }
  }
}
