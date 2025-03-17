import joi from "joi";
import appInsights from "applicationinsights";

export const getMessagingConfig = () => {
  const msgTypePrefix = "uk.gov.ffc.ahwr";

  const schema = joi.object({
    messageQueue: {
      host: joi.string().required(),
      username: joi.string(),
      password: joi.string(),
      useCredentialChain: joi.bool().required(),
      managedIdentityClientId: joi.string().optional(),
      appInsights: joi.object(),
      connectionString: joi.string().optional(),
    },
    applicationRequestQueue: {
      address: joi.string().required(),
      type: joi.string().required().valid("queue"),
    },
    applicationResponseQueue: {
      address: joi.string().required(),
      type: joi.string().required().valid("queue"),
    },
    eventQueue: {
      address: joi.string().required(),
      type: joi.string().required().valid("queue"),
    },
    applicationRequestMsgType: joi.string().required(),
  });

  const messageQueue = {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === "production",
    managedIdentityClientId: process.env.AZURE_CLIENT_ID,
    appInsights,
    connectionString: process.env.QUEUE_CONNECTION_STRING,
  };

  const config = {
    messageQueue,
    applicationRequestQueue: {
      address: process.env.APPLICATIONREQUEST_QUEUE_ADDRESS,
      type: "queue",
    },
    applicationResponseQueue: {
      address: process.env.APPLICATIONRESPONSE_QUEUE_ADDRESS,
      type: "queue",
    },
    eventQueue: {
      address: process.env.EVENT_QUEUE_ADDRESS,
      type: "queue",
    },
    applicationRequestMsgType: `${msgTypePrefix}.app.request`,
  };

  const { error } = schema.validate(config, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    throw new Error(`The message queue config is invalid. ${error.message}`);
  }
  return config;
};

const messagingConfig = getMessagingConfig();

export const applicationRequestQueue = {
  ...messagingConfig.messageQueue,
  ...messagingConfig.applicationRequestQueue,
};
export const applicationResponseQueue = {
  ...messagingConfig.messageQueue,
  ...messagingConfig.applicationResponseQueue,
};
export const eventQueue = {
  ...messagingConfig.messageQueue,
  ...messagingConfig.eventQueue,
};
export const applicationRequestMsgType =
  messagingConfig.applicationRequestMsgType;
