import joi from 'joi'
import * as applicationSchema from '../api-requests/application-api.config.schema.js'
import appInsights from 'applicationinsights'
import { config as applicationApiConfig } from '../api-requests/application-api.config.js'

export const getConfig = () => {
  const urlPrefix = '/apply'

  const tenSecondsInMilliseconds = 10000
  const oneDayInMilliseconds = 1000 * 60 * 60 * 24
  const threeDaysInMilliseconds = oneDayInMilliseconds * 3
  const oneYearInMilliseconds = oneDayInMilliseconds * 365

  const schema = joi.object({
    appInsights: joi.object(),
    namespace: joi.string().optional(),
    cache: {
      expiresIn: joi.number(),
      options: {
        host: joi.string(),
        partition: joi.string(),
        password: joi.string().allow(''),
        port: joi.number(),
        tls: joi.object()
      }
    },
    cookie: {
      cookieNameCookiePolicy: joi.string(),
      cookieNameAuth: joi.string(),
      cookieNameSession: joi.string(),
      isSameSite: joi.string(),
      isSecure: joi.bool(),
      password: joi.string().min(32).required(),
      ttl: joi.number()
    },
    cookiePolicy: {
      clearInvalid: joi.bool(),
      encoding: joi.string().valid('base64json'),
      isSameSite: joi.string(),
      isSecure: joi.bool(),
      password: joi.string().min(32).required(),
      path: joi.string(),
      ttl: joi.number()
    },
    env: joi.string().valid('development', 'test', 'production'),
    googleTagManagerKey: joi.string().allow(null, ''),
    isDev: joi.bool(),
    port: joi.number(),
    serviceUri: joi.string().uri(),
    claimServiceUri: joi.string().uri(),
    dashboardServiceUri: joi.string().uri(),
    serviceName: joi.string(),
    useRedis: joi.bool(),
    urlPrefix: joi.string(),
    ruralPaymentsAgency: {
      loginUri: joi.string().uri(),
      callChargesUri: joi.string().uri(),
      email: joi.string().email(),
      telephone: joi.string()
    },
    customerSurvey: {
      uri: joi.string().uri().optional()
    },
    applicationApi: applicationSchema.schema,
    wreckHttp: {
      timeoutMilliseconds: joi.number()
    },
    latestTermsAndConditionsUri: joi.string().required(),
    dateOfTesting: {
      enabled: joi.bool().required()
    },
    tenMonthRule: {
      enabled: joi.bool().required()
    },
    reapplyTimeLimitMonths: joi.number(),
    endemics: {
      enabled: joi.bool().required()
    },
    multiSpecies: {
      enabled: joi.bool().required()
    }
  })

  const config = {
    appInsights,
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
    applicationApi: applicationApiConfig,
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
    },
    multiSpecies: {
      enabled: process.env.MULTI_SPECIES_ENABLED === 'true'
    }
  }

  const { error } = schema.validate(config, {
    abortEarly: false,
    convert: false
  })

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`)
  }

  return config
}

export const config = getConfig()
