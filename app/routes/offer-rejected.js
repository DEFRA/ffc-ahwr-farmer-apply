module.exports = {
  method: 'GET',
  path: '/offer-rejected',
  options: {
    auth: true,
    handler: async (_, h) => {
      return h.view('offer-rejected')
    }
  }
}
