const Joi = require('joi')
const mqConfig = require('./messaging')
const authConfig = require('./auth')
const urlPrefix = '/apply'

const tenSecondsInMilliseconds = 10000
const oneDayInMilliseconds = 1000 * 60 * 60 * 24
const threeDaysInMilliseconds = oneDayInMilliseconds * 3
const oneYearInMilliseconds = oneDayInMilliseconds * 365

const schema = Joi.object({
  appInsights: Joi.object(),
  namespace: Joi.string().optional(),
  cache: {
    expiresIn: Joi.number(),
    options: {
      host: Joi.string(),
      partition: Joi.string(),
      password: Joi.string().allow(''),
      port: Joi.number(),
      tls: Joi.object()
    }
  },
  cookie: {
    cookieNameCookiePolicy: Joi.string(),
    cookieNameAuth: Joi.string(),
    cookieNameSession: Joi.string(),
    isSameSite: Joi.string(),
    isSecure: Joi.bool(),
    password: Joi.string().min(32).required(),
    ttl: Joi.number()
  },
  cookiePolicy: {
    clearInvalid: Joi.bool(),
    encoding: Joi.string().valid('base64json'),
    isSameSite: Joi.string(),
    isSecure: Joi.bool(),
    password: Joi.string().min(32).required(),
    path: Joi.string(),
    ttl: Joi.number()
  },
  env: Joi.string().valid('development', 'test', 'production'),
  googleTagManagerKey: Joi.string().allow(null, ''),
  isDev: Joi.bool(),
  port: Joi.number(),
  serviceUri: Joi.string().uri(),
  claimServiceUri: Joi.string().uri(),
  dashboardServiceUri: Joi.string().uri(),
  serviceName: Joi.string(),
  useRedis: Joi.bool(),
  urlPrefix: Joi.string(),
  ruralPaymentsAgency: {
    loginUri: Joi.string().uri(),
    callChargesUri: Joi.string().uri(),
    email: Joi.string().email(),
    telephone: Joi.string()
  },
  customerSurvey: {
    uri: Joi.string().uri().optional()
  },
  applicationApi: require('../api-requests/application-api.config.schema'),
  wreckHttp: {
    timeoutMilliseconds: Joi.number()
  },
  latestTermsAndConditionsUri: Joi.string().required(),
  dateOfTesting: {
    enabled: Joi.bool()
  },
  tenMonthRule: {
    enabled: Joi.bool().default(false)
  },
  reapplyTimeLimitMonths: Joi.number(),
  endemics: {
    enabled: Joi.bool().default(false)
  }
})

const config = {
  appInsights: require('applicationinsights'),
  namespace: process.env.NAMESPACE,
  cache: {
    expiresIn: threeDaysInMilliseconds,
    options: {
      host: process.env.REDIS_HOSTNAME || 'redis-hostname.default',
      partition: 'ffc-ahwr-frontend',
      password: process.env.REDIS_PASSWORD,
      port: Number(process.env.REDIS_PORT) || 6379,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined
    }
  },
  cookie: {
    cookieNameCookiePolicy: 'ffc_ahwr_cookie_policy',
    cookieNameAuth: 'ffc_ahwr_auth',
    cookieNameSession: 'ffc_ahwr_session',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD,
    ttl: threeDaysInMilliseconds
  },
  cookiePolicy: {
    clearInvalid: false,
    encoding: 'base64json',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    path: '/',
    password: process.env.COOKIE_PASSWORD,
    ttl: oneYearInMilliseconds
  },
  env: process.env.NODE_ENV || 'development',
  googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
  isDev: process.env.NODE_ENV === 'development',
  port: Number(process.env.PORT) || 3000,
  serviceUri: process.env.SERVICE_URI,
  claimServiceUri: process.env.CLAIM_SERVICE_URI,
  dashboardServiceUri: process.env.DASHBOARD_SERVICE_URI,
  serviceName: 'Annual health and welfare review of livestock',
  useRedis: process.env.NODE_ENV !== 'test',
  urlPrefix: process.env.URL_PREFIX || urlPrefix,
  ruralPaymentsAgency: {
    loginUri: 'https://www.ruralpayments.service.gov.uk',
    callChargesUri: 'https://www.gov.uk/call-charges',
    email: 'ruralpayments@defra.gov.uk',
    telephone: '03000 200 301'
  },
  customerSurvey: {
    uri: 'https://defragroup.eu.qualtrics.com/jfe/form/SV_4IsQyL0cOUbFDQG'
  },
  applicationApi: require('../api-requests/application-api.config'),
  wreckHttp: {
    timeoutMilliseconds: Number(process.env.WRECK_HTTP_TIMEOUT_MILLISECONDS) || tenSecondsInMilliseconds
  },
  latestTermsAndConditionsUri: process.env.TERMS_AND_CONDITIONS_URL,
  dateOfTesting: {
    enabled: process.env.DATE_OF_TESTING_ENABLED === 'true'
  },
  tenMonthRule: {
    enabled: process.env.TEN_MONTH_RULE_ENABLED === 'true'
  },
  reapplyTimeLimitMonths: 10,
  endemics: {
    enabled: process.env.ENDEMICS_ENABLED === 'true'
  }
}

const { error } = schema.validate(config, {
  abortEarly: false,
  convert: false
})

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = {
  ...config,
  mqConfig,
  authConfig
}
