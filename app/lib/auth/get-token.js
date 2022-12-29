const { v4: uuid } = require('uuid')
const { testToken } = require('../../config').notifyConfig
const { getByEmailAndSbi } = require('../../api-requests/users')

module.exports = async function getToken (email, sbi) {
  if (testToken) {
    const user = await getByEmailAndSbi(email, sbi)
    if (user.isTest) {
      return testToken
    }
  }
  return uuid()
}
