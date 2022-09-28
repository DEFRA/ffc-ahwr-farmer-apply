module.exports = {
  method: 'GET',
  path: '/terms',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('terms')
    }
  }
}
