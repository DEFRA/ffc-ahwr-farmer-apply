import { applicationApiConfigSchema } from "./application-api.config.schema.js";

const getConfig = () => {
  const config = {
    uri: process.env.APPLICATION_API_URI,
  };

  const result = applicationApiConfigSchema.validate(config, {
    abortEarly: false,
  });

  if (result.error) {
    throw new Error(`The config is invalid: ${result.error.message}`);
  }

  return config;
};

export const config = getConfig();
