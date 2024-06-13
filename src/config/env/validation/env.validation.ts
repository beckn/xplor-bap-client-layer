// Import Joi for schema validation.
import * as Joi from 'joi';
import { EnvDefaultValues } from '../../../common/constants/env-values';

// Export a function that returns a configuration object with validation rules.
export default () => ({
  // Validate the NODE_ENV environment variable. It must be a string and one of the specified values. Default to 'development' if not provided.
  NODE_ENV: Joi.string()
    .required()
    .valid(
      EnvDefaultValues.NODE_ENV_DEV,
      EnvDefaultValues.NODE_ENV_PROD,
      EnvDefaultValues.NODE_ENV_TEST,
      EnvDefaultValues.NODE_ENV_PROV,
    )
    .default(EnvDefaultValues.NODE_ENV),
  // Validate the PORT environment variable. It must be a number and a valid port. Default to 5000 if not provided.
  PORT: Joi.number().port().required().default(EnvDefaultValues.PORT),
  // Validate the DATABASE_URL environment variable. It must be a string and is required. Default to 'mongodb://localhost:27017/Xplore' if not provided.
  DATABASE_URL: Joi.string().required().default(EnvDefaultValues.DATABASE_URL),
  // Validate the CORE_SERVICE_URL environment variable. It must be a string and is required. Default to 'http://localhost:5000' if not provided.
  CORE_SERVICE_URL: Joi.string().required().default(EnvDefaultValues.CORE_SERVICE_URL),
  ES_SERVICE_URL: Joi.string().required().default(EnvDefaultValues.ES_SERVICE_URL),
  STG_SERVICE_URL: Joi.string().required().default(EnvDefaultValues.STG_SERVICE_URL),
  KAFKA_BROKERS: Joi.string().required().default(EnvDefaultValues.KAFKA_BROKERS),
  ES_USERNAME: Joi.string().required().default(EnvDefaultValues.ES_USERNAME),
  ES_PASSWORD: Joi.string().required().default(EnvDefaultValues.ES_PASSWORD),
  KAFKA_CLIENT_ID: Joi.string().required().default(EnvDefaultValues.KAFKA_CLIENT_ID),
  KAFKA_GROUP_ID: Joi.string().required().default(EnvDefaultValues.KAFKA_GROUP_ID),
});
