const axios = require('axios')
const config = require('../../config').authConfig
const { buildRefreshFormData, buildAuthFormData } = require('./parameters')

const retrieveToken = async (request, refresh) => {
  const url = config.defraId.hostname + '/b2c_1a_signupsigninsfi/oauth2/v2.0/token'
  const data = refresh ? buildRefreshFormData(request) : buildAuthFormData(request)

  const options = {
    method: 'post',
    url,
    port: 443,
    headers: {
      ...data.getHeaders()
    },
    data
  }

  return axios(options)
}

module.exports = retrieveToken
