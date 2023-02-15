jest.setTimeout(10000)

describe('verify-login route', () => {
  let urlPrefix
  let setFarmerApplyData
  let lookupToken
  let setAuthCookie

  beforeAll(async () => {
    jest.resetAllMocks()
    jest.mock('ffc-ahwr-event-publisher')
    jest.mock('../../../../app/session', () => {
      return {
        setFarmerApplyData: jest.fn().mockImplementation()
      }
    })

    const session = require('../../../../app/session')
    setFarmerApplyData = session.setFarmerApplyData

    jest.mock('../../../../app/auth', () => {
      return {
        lookupToken: jest.fn().mockImplementation(() => {
          return { email: 'someemail@email.com' }
        }),
        setAuthCookie: jest.fn()
      }
    })

    const auth = require('../../../../app/auth')
    lookupToken = auth.lookupToken
    setAuthCookie = auth.lookupToken

    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      selectYourBusiness: {
        enabled: false
      }
    }))
    const config = require('../../../../app/config')
    urlPrefix = config.urlPrefix
  })

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('GET /verify-login returns 400 when missing token', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/verify-login?email=test@test.com`
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('GET /verify-login returns 400 when cached email does not match email query param', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/verify-login?email=test@test.com&token=0c8f9708-453b-11ed-b878-0242ac120002`
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('GET /verify-login returns 302', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/verify-login?email=someemail@email.com&token=0c8f9708-453b-11ed-b878-0242ac120002`
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(302)
    expect(lookupToken).toBeCalledTimes(1)
    expect(setAuthCookie).toBeCalledTimes(1)
    expect(setFarmerApplyData).toBeCalledTimes(1)
  })

  describe('verify-login with select your business feature', () => {
    let urlPrefix
    let lookupToken
    let setAuthCookie
    let setFarmerApplyData

    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('ffc-ahwr-event-publisher')
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        selectYourBusiness: {
          enabled: true
        }
      }))
      const config = require('../../../../app/config')
      urlPrefix = config.urlPrefix

      jest.mock('../../../../app/session', () => {
        return {
          setFarmerApplyData: jest.fn().mockImplementation()
        }
      })

      const session = require('../../../../app/session')
      setFarmerApplyData = session.setFarmerApplyData

      jest.mock('../../../../app/auth', () => {
        return {
          lookupToken: jest.fn().mockImplementation(() => {
            return { email: 'someemail@email.com' }
          }),
          setAuthCookie: jest.fn()
        }
      })
      const auth = require('../../../../app/auth')
      lookupToken = auth.lookupToken
      setAuthCookie = auth.lookupToken
    })

    beforeEach(async () => {
      jest.clearAllMocks()
    })

    test('GET /verify-login returns 302 and does set auth cookie', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/verify-login?email=someemail@email.com&token=0c8f9708-453b-11ed-b878-0242ac120002`
      }
      const result = await global.__SERVER__.inject(options)
      expect(result.statusCode).toBe(302)
      expect(lookupToken).toBeCalledTimes(1)
      expect(setAuthCookie).toHaveBeenCalledTimes(1)
      expect(setFarmerApplyData).toBeCalledTimes(0)
    })
  })
})
