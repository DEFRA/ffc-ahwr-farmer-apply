module.exports = {
  method: 'GET',
  path: '/farmer-apply',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('index')
    }
  }
}
