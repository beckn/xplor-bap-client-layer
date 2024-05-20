// Define an interface for the response structure of a health check endpoint.
export interface IHealthCheckResponse {
  // The status of the health check, typically 'OK' for success or 'ERROR' for failure.
  status: string;
  // A message providing more details about the health check status.
  message: string;
}
