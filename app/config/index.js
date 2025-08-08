import joi from "joi";
import { applicationApiConfigSchema } from "../api-requests/application-api.config.schema.js";
import appInsights from "applicationinsights";
import { config as applicationApiConfig } from "../api-requests/application-api.config.js";

const DAYS_IN_YEAR = 365;
const DAYS_CACHE_ENTRY_VALID = 3;
const TEN_SECONDS_IN_MILLIS = 10000;
const ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
const THREE_DAYS_IN_MILLIS = ONE_DAY_IN_MILLIS * DAYS_CACHE_ENTRY_VALID;
const ONE_YEAR_IN_MILLIS = ONE_DAY_IN_MILLIS * DAYS_IN_YEAR;

const DEFAULT_APP_PORT = 3000;
const DEFAULT_REDIS_PORT = 6379;

const getSchema = () => {
  return joi.object({
    appInsights: joi.object(),
    namespace: joi.string().optional(),
    cache: {
      expiresIn: joi.number(),
      options: {
        host: joi.string(),
        partition: joi.string(),
        password: joi.string().allow(""),
        port: joi.number(),
        tls: joi.object(),
      },
    },
    cookie: {
      cookieNameCookiePolicy: joi.string(),
      cookieNameAuth: joi.string(),
      cookieNameSession: joi.string(),
      isSameSite: joi.string(),
      isSecure: joi.bool(),
      password: joi.string().min(32).required(),
      ttl: joi.number(),
    },
    cookiePolicy: {
      clearInvalid: joi.bool(),
      encoding: joi.string().valid("base64json"),
      isSameSite: joi.string(),
      isSecure: joi.bool(),
      password: joi.string().min(32).required(),
      path: joi.string(),
      ttl: joi.number(),
    },
    env: joi.string().valid("development", "test", "production"),
    googleTagManagerKey: joi.string().allow(null, ""),
    isDev: joi.bool(),
    port: joi.number(),
    serviceUri: joi.string().uri(),
    claimServiceUri: joi.string().uri(),
    dashboardServiceUri: joi.string().uri(),
    useRedis: joi.bool(),
    urlPrefix: joi.string(),
    customerSurvey: {
      uri: joi.string().uri().optional(),
    },
    applicationApi: applicationApiConfigSchema,
    wreckHttp: {
      timeoutMilliseconds: joi.number(),
    },
    latestTermsAndConditionsUri: joi.string().required(),
    reapplyTimeLimitMonths: joi.number(),
    devLogin: {
      enabled: joi.bool().required(),
    },
  })
};

export const getConfig = () => {
  const urlPrefix = "/apply";


  const mainConfig = {
    appInsights,
    namespace: process.env.NAMESPACE,
    cache: {
      expiresIn: THREE_DAYS_IN_MILLIS,
      options: {
        host: process.env.REDIS_HOSTNAME || "redis-hostname.default",
        partition: "ffc-ahwr-frontend",
        password: process.env.REDIS_PASSWORD,
        port: Number(process.env.REDIS_PORT) || DEFAULT_REDIS_PORT,
        tls: process.env.NODE_ENV === "production" ? {} : undefined,
      },
    },
    cookie: {
      cookieNameCookiePolicy: "ffc_ahwr_cookie_policy",
      cookieNameAuth: "ffc_ahwr_auth",
      cookieNameSession: "ffc_ahwr_session",
      isSameSite: "Lax",
      isSecure: process.env.NODE_ENV === "production",
      password: process.env.COOKIE_PASSWORD,
      ttl: THREE_DAYS_IN_MILLIS,
    },
    cookiePolicy: {
      clearInvalid: false,
      encoding: "base64json",
      isSameSite: "Lax",
      isSecure: process.env.NODE_ENV === "production",
      path: "/",
      password: process.env.COOKIE_PASSWORD,
      ttl: ONE_YEAR_IN_MILLIS,
    },
    env: process.env.NODE_ENV || "development",
    googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
    isDev: process.env.NODE_ENV === "development",
    port: Number(process.env.PORT) || DEFAULT_APP_PORT,
    serviceUri: process.env.SERVICE_URI,
    claimServiceUri: process.env.CLAIM_SERVICE_URI,
    dashboardServiceUri: process.env.DASHBOARD_SERVICE_URI,
    useRedis: process.env.NODE_ENV !== "test",
    urlPrefix: process.env.URL_PREFIX || urlPrefix,
    customerSurvey: {
      uri: process.env.CUSTOMER_SURVEY_APPLY_URI,
    },
    applicationApi: applicationApiConfig,
    wreckHttp: {
      timeoutMilliseconds:
        Number(process.env.WRECK_HTTP_TIMEOUT_MILLISECONDS) ||
        TEN_SECONDS_IN_MILLIS,
    },
    latestTermsAndConditionsUri: process.env.TERMS_AND_CONDITIONS_URL,
    reapplyTimeLimitMonths: 10,
    devLogin: {
      enabled: process.env.DEV_LOGIN_ENABLED === "true",
    }
  };

  const { error } = getSchema().validate(mainConfig, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`);
  }

  return mainConfig;
};

export const config = getConfig();
