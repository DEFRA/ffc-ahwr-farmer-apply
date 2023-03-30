const config = require('../../../config')

module.exports = [
  `https://${config.authConfig.defraId.tenantName}.b2clogin.com/${config.authConfig.defraId.jwtIssuerId}/v2.0/`
]
