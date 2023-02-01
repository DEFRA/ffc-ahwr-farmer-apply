const urlPrefix = require('../config/index').urlPrefix

module.exports = {
  method: 'GET',
  path: `${urlPrefix}/no-eligible-businesses`,
  options: {
    handler: async (request, h) => {
        return h.view('no-eligible-businesses');
      }
  }
}
