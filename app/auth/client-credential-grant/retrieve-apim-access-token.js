import Wreck from '@hapi/wreck'
import { config } from '../../config/index.js'
import { authConfig } from '../../config/auth.js'
import FormData from 'form-data'

export const retrieveApimAccessToken = async () => {
  const uri = `${authConfig.apim.hostname}${authConfig.apim.oAuthPath}`
  const data = new FormData()
  data.append('client_id', `${authConfig.apim.clientId}`)
  data.append('client_secret', `${authConfig.apim.clientSecret}`)
  data.append('scope', `${authConfig.apim.scope}`)
  data.append('grant_type', 'client_credentials')

  const response = await Wreck.post(
    uri,
    {
      headers: data.getHeaders(),
      payload: data,
      json: true,
      timeout: config.wreckHttp.timeoutMilliseconds
    }
  )

  return `${response?.payload.token_type} ${response?.payload.access_token}`
}
