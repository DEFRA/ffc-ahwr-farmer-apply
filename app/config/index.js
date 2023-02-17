const Joi = require('joi')
const mqConfig = require('./messaging')
const notifyConfig = require('./notify')
const urlPrefix = '/apply'

const schema = Joi.object({
  appInsights: Joi.object(),
  cache: {
    expiresIn: Joi.number().default(1000 * 3600 * 24 * 3), // 3 days
    options: {
      host: Joi.string().default('redis-hostname.default'),
      partition: Joi.string().default('ffc-ahwr-frontend'),
      password: Joi.string().allow(''),
      port: Joi.number().default(6379),
      tls: Joi.object()
    }
  },
  cookie: {
    cookieNameCookiePolicy: Joi.string().default('ffc_ahwr_cookie_policy'),
    cookieNameAuth: Joi.string().default('ffc_ahwr_auth'),
    cookieNameSession: Joi.string().default('ffc_ahwr_session'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.boolean().default(true),
    password: Joi.string().min(32).required(),
    ttl: Joi.number().default(1000 * 3600 * 24 * 3) // 3 days
  },
  cookiePolicy: {
    clearInvalid: Joi.bool().default(false),
    encoding: Joi.string().valid('base64json').default('base64json'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.bool().default(true),
    password: Joi.string().min(32).required(),
    path: Joi.string().default('/'),
    ttl: Joi.number().default(1000 * 60 * 60 * 24 * 365) // 1 year
  },
  env: Joi.string().valid('development', 'test', 'production').default(
    'development'
  ),
  googleTagManagerKey: Joi.string().allow(null, ''),
  isDev: Joi.boolean().default(false),
  port: Joi.number().default(3000),
  serviceUri: Joi.string().uri(),
  claimServiceUri: Joi.string().uri(),
  serviceName: Joi.string().default('Annual health and welfare review of livestock'),
  useRedis: Joi.boolean().default(false),
  urlPrefix: Joi.string().default(urlPrefix),
  ruralPaymentsLoginUri: Joi.string().uri().default('https://www.ruralpayments.service.gov.uk'),
  callChargesUri: Joi.string().uri().default('https://www.gov.uk/call-charges'),
  ruralPaymentsEmail: Joi.string().email().default('ruralpayments@defra.gov.uk'),
  registerYourInterest: {
    enabled: Joi.bool().default(true)
  },
  eligibilityApi: require('../api-requests/eligibility-api.config.schema'),
  applicationApi: require('../api-requests/application-api.config.schema'),
  selectYourBusiness: {
    enabled: Joi.bool().default(false)
  }
})

const config = {
  appInsights: require('applicationinsights'),
  cache: {
    options: {
      host: process.env.REDIS_HOSTNAME,
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined
    }
  },
  cookie: {
    cookieNameCookiePolicy: 'ffc_ahwr_cookie_policy',
    cookieNameAuth: 'ffc_ahwr_auth',
    cookieNameSession: 'ffc_ahwr_session',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  cookiePolicy: {
    clearInvalid: false,
    encoding: 'base64json',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  env: process.env.NODE_ENV,
  googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
  isDev: process.env.NODE_ENV === 'development',
  port: process.env.PORT,
  serviceUri: process.env.SERVICE_URI,
  claimServiceUri: process.env.CLAIM_SERVICE_URI,
  useRedis: process.env.NODE_ENV !== 'test',
  urlPrefix: process.env.URL_PREFIX,
  ruralPaymentsLoginUri: 'https://www.ruralpayments.service.gov.uk',
  callChargesUri: 'https://www.gov.uk/call-charges',
  ruralPaymentsEmail: 'ruralpayments@defra.gov.uk',
  registerYourInterest: {
    enabled: process.env.REGISTER_YOUR_INTEREST_ENABLED
  },
  eligibilityApi: require('../api-requests/eligibility-api.config'),
  applicationApi: require('../api-requests/application-api.config'),
  selectYourBusiness: {
    enabled: process.env.SELECT_YOUR_BUSINESS_ENABLED
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

const value = result.value
value.mqConfig = mqConfig
value.notifyConfig = notifyConfig

module.exports = value
