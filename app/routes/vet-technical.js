module.exports = [{
  method: 'GET',
  path: '/test-cattle',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-cattle')
    }
  }
}, {
  method: 'GET',
  path: '/test-pigs',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-pigs')
    }
  }
}, {
  method: 'GET',
  path: '/test-sheep',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('test-sheep')
    }
  }
}, {
  method: 'GET',
  path: '/labs-cattle',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-cattle')
    }
  }
}, {
  method: 'GET',
  path: '/labs-pigs',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-pigs')
    }
  }
}, {
  method: 'GET',
  path: '/labs-sheep',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('labs-sheep')
    }
  }
}]
