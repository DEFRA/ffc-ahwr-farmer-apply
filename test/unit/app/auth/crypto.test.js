const { createCryptoProvider } = require('../../../../app/auth/auth-code-grant/proof-key-for-code-exchange')

describe('Crypto functions test', () => {
  test('when createCryptoProvider verifier value set in session', async () => {
    const setPkcecodesMock = jest.fn()
    const session = {
      setPkcecodes: setPkcecodesMock
    }
    const result = createCryptoProvider(session, undefined)
    expect(result).not.toBeNull()
    expect(setPkcecodesMock).toBeCalledWith(undefined, 'verifier', expect.anything())
  })
})
