const { createCryptoProvider } = require('../../../../app/auth/crypto')

describe('Crypto functions test', () => {
    test('when createCryptoProvider verifier value set in session', async () => {
        var setPkcecodesMock = jest.fn()
        const session = {
            setPkcecodes: setPkcecodesMock
        }
        var result = createCryptoProvider(session, undefined)
        expect(result).not.toBeNull
        expect(setPkcecodesMock).toBeCalledWith(undefined, 'verifier', expect.anything())
    })
})