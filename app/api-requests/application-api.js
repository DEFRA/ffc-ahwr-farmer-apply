const Wreck = require('@hapi/wreck')
const config = require('../config')

async function getLatestApplicationsBySbi (sbi) {
  const response = await Wreck.get(
    `${config.applicationApi.uri}/applications/latest?sbi=${sbi}`,
    { json: true }
  )

  return response.payload
}

module.exports = {
  getLatestApplicationsBySbi
}
