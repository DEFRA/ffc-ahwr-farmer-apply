const { generateNonce, generateState } = require('../../../../app/auth/verification')

describe('Verification functions test', () => {
    jest.mock('uuid', () => ({ v4: () => '123456789' }))

    test('when generateNonce token value set in session', async () => {
        var setTokenMock = jest.fn()
        const session = {
            setToken: setTokenMock
        }
        var result = generateNonce(session, undefined)
        expect(result).not.toBeNull
        expect(setTokenMock).toHaveBeenCalledWith(undefined, 'nonce', result)
    })

    test('when generateState token value set in session', async () => {
        var setTokenMock = jest.fn()
        const session = {
            setToken: setTokenMock
        }
        var result = generateState(session, undefined)
        expect(result).not.toBeNull
        expect(setTokenMock).toHaveBeenCalledWith(undefined, 'state', result)
    })
})