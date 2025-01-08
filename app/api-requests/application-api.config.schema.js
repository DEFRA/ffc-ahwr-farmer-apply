import joi from 'joi'

export const schema = joi.object({
  uri: joi.string().uri().default('http://host.docker.internal:3001/api')
})
