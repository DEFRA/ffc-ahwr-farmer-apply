const Wreck = require('@hapi/wreck')
const config = require('../../config')

const acquireSigningKey = async () => {
  const response = await Wreck.get(
    `${config.authConfig.defraId.hostname}/discovery/v2.0/keys?p=${config.authConfig.defraId.policy}`,
    {
      json: true
    }
  )

  return response.payload.keys[0]
}

module.exports = acquireSigningKey
