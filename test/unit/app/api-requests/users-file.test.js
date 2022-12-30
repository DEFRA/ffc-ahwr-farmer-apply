const { getByEmailAndSbi } = require('../../../../app/api-requests/users')
const mockConfig = require('../../../../app/config')

describe('Get users from users file', () => {
  let downloadBlobMock
  let getByEmailAndSbi
  const email = 'hit@email.com'
  const sbi = '123456789'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    jest.mock('../../../../app/config', () => ({
      ...mockConfig,
      eligibilityApi: {
        enabled: false
      }
    }))

    downloadBlobMock = require('../../../../app/lib/storage/download-blob')
    jest.mock('../../../../app/lib/storage/download-blob')

    const users = require('../../../../app/api-requests/users')
    getByEmailAndSbi = users.getByEmailAndSbi
  })

  test('makes request to download users blob', async () => {
    await getByEmailAndSbi('email', 'sbi')

    expect(downloadBlobMock).toHaveBeenCalledTimes(1)
    expect(downloadBlobMock).toHaveBeenCalledWith(
      mockConfig.storageConfig.usersContainer,
      mockConfig.storageConfig.usersFile
    )
  })

  test.each([
    { fileContent: null },
    { fileContent: undefined }
  ])('return undefined when blob content is $fileContent', async ({ fileContent }) => {
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmailAndSbi('email', 'sbi')

    expect(res).toEqual(undefined)
  })

  test('return undefined when email doesn\'t match any users', async () => {
    const fileContent = '[{ "email": "a@b.com" }]'
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await await getByEmailAndSbi('email', 'sbi')

    expect(res).toEqual(undefined)
  })

  test('return user data when email is matched', async () => {
    const fileContent = `[{ "email": "${email}" }]`
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmailAndSbi(email, sbi)

    expect(res).toEqual(JSON.parse(fileContent)[0])
  })

  test.each([
    { fileContent: `[{ "email": "${email}" }]` },
    { fileContent: `[{ "email": "${email}" , "isTest": true }]` }
  ])('return user data when test email is matched but has different casing', async ({ fileContent }) => {
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmailAndSbi(email.toUpperCase(), sbi)

    expect(res).toEqual(JSON.parse(fileContent)[0])
    expect(res.isTest).toEqual(JSON.parse(fileContent)[0].isTest)
  })
})
