const downloadBlob = require('../lib/storage/download-blob')
const { usersContainer, usersFile } = require('../config').storageConfig

async function getUsers () {
  const contents = await downloadBlob(usersContainer, usersFile) ?? '[]'
  return JSON.parse(contents)
}

module.exports = {
  getUsers
}
