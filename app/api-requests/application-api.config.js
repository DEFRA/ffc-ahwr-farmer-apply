import { applicationApiConfigSchema } from "./application-api.config.schema.js";

export const getConfig = () => {
  const apiConfig = {
    uri: process.env.APPLICATION_API_URI,
  };

  const { error } = applicationApiConfigSchema.validate(apiConfig, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(`The config is invalid: ${error.message}`);
  }

  return apiConfig;
};

export const config = getConfig();
