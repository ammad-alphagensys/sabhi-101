import Joi from "joi";

export const schema = Joi.object({
  PORT: Joi.number().required(),
  API_VERSION: Joi.string().required(),
  NODE_ENV: Joi.string().valid("development", "staging", "production").required(),
  APP_URL: Joi.string().uri().required(),

  SENTRY_DSN: Joi.string().optional(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().required(),

  MONGO_URL: Joi.string().uri().required(),

  S3_BUCKET_NAME: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_REGION: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRE: Joi.string().required(),
  JWT_REFRESH_EXPIRE: Joi.string().required(),

  MAILTRAP_FROM: Joi.string().email().required(),
  MAILTRAP_HOST: Joi.string().required(),
  MAILTRAP_PORT: Joi.number().required(),
  MAILTRAP_USERNAME: Joi.string().required(),
  MAILTRAP_PASSWORD: Joi.string().required(),

  SENDGRID_SENDER_EMAIL: Joi.string().email().required(),
  SENDGRID_HOST: Joi.string().required(),
  SENDGRID_PORT: Joi.number().required(),
  SENDGRID_API_KEY: Joi.string().required(),
}).unknown(true); // allow extra env vars

export { schema as envJoi };
