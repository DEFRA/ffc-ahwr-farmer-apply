const urlPrefix = require('../config/index').urlPrefix
module.exports = [{
  method: 'GET',
  path: `${urlPrefix}`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-farmers')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/guidance-for-farmers`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-farmers')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/guidance-for-vet`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-vet')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/guidance-for-vet-technical`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-vet-technical')
    }
  }
}]
