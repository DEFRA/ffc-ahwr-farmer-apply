import joi from "joi";

export const getAuthConfig = () => {
  const schema = joi.object({
    defraId: {
      hostname: joi.string().uri(),
      oAuthAuthorisePath: joi.string(),
      policy: joi.string(),
      dashboardRedirectUri: joi.string().uri(),
      clientId: joi.string(),
      serviceId: joi.string(),
      scope: joi.string(),
    }
  });

  const config = {
    defraId: {
      hostname: `https://${process.env.DEFRA_ID_TENANT}.b2clogin.com/${process.env.DEFRA_ID_TENANT}.onmicrosoft.com`,
      oAuthAuthorisePath: "/oauth2/v2.0/authorize",
      policy: process.env.DEFRA_ID_POLICY,
      dashboardRedirectUri: process.env.DEFRA_ID_DASHBOARD_REDIRECT_URI,
      clientId: process.env.DEFRA_ID_CLIENT_ID,
      serviceId: process.env.DEFRA_ID_SERVICE_ID,
      scope: `openid ${process.env.DEFRA_ID_CLIENT_ID} offline_access`,
    }
  };

  const { error } = schema.validate(config, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    throw new Error(`The auth config is invalid. ${error.message}`);
  }

  return config;
};

export const authConfig = getAuthConfig();
