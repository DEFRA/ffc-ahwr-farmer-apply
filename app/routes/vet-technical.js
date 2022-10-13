const urlPrefix = require('../config/index').urlPrefix
module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/test-cattle`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-cattle')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/test-pigs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-pigs')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/test-sheep`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-sheep')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/labs-cattle`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-cattle')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/labs-pigs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-pigs')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/labs-sheep`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-sheep')
    }
  }
}]
