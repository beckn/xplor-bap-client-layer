// Export a function that returns a configuration object.
// This configuration object is used to set up the application environment.
export default () => ({
  // Parse the PORT environment variable to an integer. This is the port on which the application will run.
  port: parseInt(process.env.PORT, 10),
  // Use the DATABASE_URL environment variable to set the MongoDB connection string.
  databaseUrl: process.env.DATABASE_URL,
  // Use the NODE_ENV environment variable to set the application environment (e.g., 'development', 'production').
  node_env: process.env.NODE_ENV,
  // Use the CORE_SERVICE_URL environment variable to set the URL of the core service.
  coreServiceUrl: process.env.CORE_SERVICE_URL,
  esServiceUrl: process.env.ES_SERVICE_URL,
  stgServiceUrl: process.env.STG_SERVICE_URL,
  kafkaBrokers: process.env.KAFKA_BROKERS,
  esUsername: process.env.ES_USERNAME,
  esPassword: process.env.ES_PASSWORD,
  kafkaClientId: process.env.KAFKA_CLIENT_ID,
  kafkaGroupId: process.env.KAFKA_GROUP_ID,
  ilBaseUrl: process.env.IL_BASE_URL,
  gclBaseUrl: process.env.GCL_BASE_URL,
});
