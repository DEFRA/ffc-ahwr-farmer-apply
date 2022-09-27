module.exports = {
  method: 'GET',
  path: '/guidance-for-farmers',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('guidance-for-farmers')
    }
  }
}
