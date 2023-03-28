const CryptoJS = require('crypto-js')
const jwtSecret = process.env.FFC_AHWR_AUTOMATION_NOTIFY_JWT_SECRET
const jwtIssuer = process.env.FFC_AHWR_AUTOMATION_NOTIFY_JWT_ISSUER

function getSignedJwt () {
  try {
    const header = {
      typ: 'JWT',
      alg: 'HS256'
    }

    const currentTimestamp = Math.floor(Date.now() / 1000)

    const data = {
      iss: jwtIssuer,
      iat: currentTimestamp,
      exp: currentTimestamp + 3000, // expiry time is 30 seconds from time of creation
      jti: 'jwt_nonce'
    }

    function base64url (source) {
      let encodedSource = CryptoJS.enc.Base64.stringify(source)

      encodedSource = encodedSource.replace(/=+$/, '')
      encodedSource = encodedSource.replace(/\+/g, '-')
      encodedSource = encodedSource.replace(/\//g, '_')

      return encodedSource
    }

    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header))
    const encodedHeader = base64url(stringifiedHeader)

    const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data))
    const encodedData = base64url(stringifiedData)

    const token = `${encodedHeader}.${encodedData}`

    let signature = CryptoJS.HmacSHA256(token, jwtSecret)
    signature = base64url(signature)
    const signedToken = `${token}.${signature}`

    console.log('Signed and encoded JWT', signedToken)
    return signedToken
  } catch (error) {
    console.log('Error signing and encoding JWT', error)
    return null
  }
}

module.exports = getSignedJwt
