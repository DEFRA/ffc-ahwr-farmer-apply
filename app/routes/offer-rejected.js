module.exports = {
  method: 'GET',
  path: '/offer-rejected',
  options: {
    handler: async (_, h) => {
      return h.view('offer-rejected')
    }
  }
}
