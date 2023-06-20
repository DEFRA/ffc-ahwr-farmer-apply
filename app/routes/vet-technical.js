const urlPrefix = require('../config/index').urlPrefix
module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/test-cattle`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/test-cattle')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/test-pigs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/test-pigs')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/test-sheep`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/test-sheep')
    }
  }
}, {
  method: 'GET',
  path: `${urlPrefix}/vet-technical-guidance-cattle`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/vet-technical-guidance-cattle')
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/recommended-cattle-labs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/recommended-cattle-labs')
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/vet-technical-guidance-pigs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/vet-technical-guidance-pigs')
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/recommended-pig-labs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/recommended-pig-labs')
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/vet-technical-guidance-sheep`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/vet-technical-guidance-sheep')
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/recommended-sheep-labs`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance/recommended-sheep-labs')
    }
  }
}]
