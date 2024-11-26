const Joi = require('joi')

const msgTypePrefix = 'uk.gov.ffc.ahwr'

const schema = Joi.object({
  messageQueue: {
    host: Joi.string().required(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool(),
    appInsights: Joi.object()
  },
  applicationRequestQueue: {
    address: Joi.string().required(),
    type: Joi.string().required().valid('queue')
  },
  applicationResponseQueue: {
    address: Joi.string().required(),
    type: Joi.string().required().valid('queue')
  },
  eventQueue: {
    address: Joi.string().required(),
    type: Joi.string().required().valid('queue')
  },
  applicationRequestMsgType: Joi.string().required()
})

const messageQueue = {
  host: process.env.MESSAGE_QUEUE_HOST,
  username: process.env.MESSAGE_QUEUE_USER,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  useCredentialChain: process.env.NODE_ENV === 'production',
  appInsights: require('applicationinsights')
}

const config = {
  messageQueue,
  applicationRequestQueue: {
    address: process.env.APPLICATIONREQUEST_QUEUE_ADDRESS,
    type: 'queue'
  },
  applicationResponseQueue: {
    address: process.env.APPLICATIONRESPONSE_QUEUE_ADDRESS,
    type: 'queue'
  },
  eventQueue: {
    address: process.env.EVENT_QUEUE_ADDRESS,
    type: 'queue'
  },
  applicationRequestMsgType: `${msgTypePrefix}.app.request`
}

const { error } = schema.validate(config, {
  abortEarly: false,
  convert: false
})

if (error) {
  throw new Error(`The message queue config is invalid. ${error.message}`)
}

module.exports = {
  applicationRequestQueue: { ...messageQueue, ...config.applicationRequestQueue },
  applicationResponseQueue: { ...messageQueue, ...config.applicationResponseQueue },
  eventQueue: { ...messageQueue, ...config.eventQueue },
  applicationRequestMsgType: config.applicationRequestMsgType
}
