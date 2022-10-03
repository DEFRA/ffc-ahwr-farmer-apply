module.exports = [{
  method: 'GET',
  path: '/',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-farmers')
    }
  }
}, {
  method: 'GET',
  path: '/guidance-for-farmers',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-farmers')
    }
  }
}, {
  method: 'GET',
  path: '/guidance-for-vet',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-vet')
    }
  }
}, {
  method: 'GET',
  path: '/guidance-for-vet-technical',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-vet-technical')
    }
  }
}]
