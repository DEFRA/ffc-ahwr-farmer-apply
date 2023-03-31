const wreck = require('@hapi/wreck')
const session = require('../../session')
const { tokens } = require('../../session/keys')

const get = async (hostname, url, request, headers = {}) => {
  const token = session.getToken(request, tokens.accessToken)
  headers.Authorization = token
  const response = await wreck.get(`${hostname}${url}`,
    {
      headers,
      json: true,
      rejectUnauthorized: false
    })
  return response?.payload
}

module.exports = {
  get
}
