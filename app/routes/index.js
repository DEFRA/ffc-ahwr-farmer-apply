module.exports = {
  method: 'GET',
  path: '/apply',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('index')
    }
  }
}
