const wreck = require('@hapi/wreck')
const session = require('../../session')
const { tokens } = require('../../session/keys')

const get = async (hostname, url, request, headers = {}) => {
  const token = session.getToken(request, tokens.accessToken)
  headers.Authorization = token
  console.log(`${new Date().toISOString()} Request Message to RPA: ${JSON.stringify(`${hostname}${url}`)}`)

  try {
    const response = await wreck.get(`${hostname}${url}`,
      {
        headers,
        json: true,
        rejectUnauthorized: false
      })

    console.log(`${new Date().toISOString()} Response Status Code from RPA: ${JSON.stringify(response.res.statusCode)}`)
    return response?.payload
  } catch (error) {
    console.log(`${new Date().toISOString()} Response Message from RPA: ${JSON.stringify(error.message)}`)
    throw new Error(`Error received from RPA API: ${error.message}`)
  }
}

module.exports = {
  get
}
