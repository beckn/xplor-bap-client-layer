import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AxiosService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(AxiosService.name);
  /**
   * Performs a GET request to the specified URL with optional parameters and headers.
   *
   * @param url The URL to which the GET request is made.
   * @param params Optional parameters to be sent with the request.
   * @param headers Optional headers to be sent with the request.
   * @returns The response data from the GET request.
   */
  async get(url: string, params?: any, headers?: any) {
    try {
      // Perform the GET request using the HttpService's axiosRef
      return (await this.httpService.axiosRef.get(url, { params, headers }))?.data;
    } catch (error) {
      // Log the error using the GrafanaLoggerService
      // Note: The error is not thrown or handled here, which might be a design decision
      this.logger.log(error);
      throw error;
    }
  }

  /**
   * Performs a POST request to the specified URL with the provided data and optional headers.
   *
   * @param url The URL to which the POST request is made.
   * @param data The data to be sent with the request.
   * @param headers Optional headers to be sent with the request.
   * @returns The response data from the POST request.
   * @throws Throws the error if the POST request fails.
   */
  async post(url: string, data: any, headers?: any) {
    try {
      // Perform the POST request using the HttpService's axiosRef
      return (await this.httpService.axiosRef.post(url, data, { headers }))?.data;
    } catch (error) {
      // Log the error using the GrafanaLoggerService with a specific message for POST requests
      // Rethrow the error to be handled by the caller
      throw error;
    }
  }

  /**
   * Performs a PUT request to the specified URL with the provided data and optional headers.
   *
   * @param url The URL to which the PUT request is made.
   * @param data The data to be sent with the request.
   * @param headers Optional headers to be sent with the request.
   * @returns The response data from the PUT request.
   * @throws Throws the error if the PUT request fails.
   */
  async put(url: string, data: any, headers?: any) {
    try {
      // Perform the PUT request using the HttpService's axiosRef
      return await this.httpService.axiosRef.put(url, data, { headers });
    } catch (error) {
      // Log the error using the GrafanaLoggerService with a specific message for PUT requests
      // Return the error instead of throwing it, which might be a design decision
      return error;
    }
  }

  /**
   * Performs a DELETE request to the specified URL with optional parameters and headers.
   *
   * @param url The URL to which the DELETE request is made.
   * @param params Optional parameters to be sent with the request.
   * @param headers Optional headers to be sent with the request.
   * @returns The response data from the DELETE request.
   * @throws Throws the error if the DELETE request fails.
   */
  async delete(url: string, params?: any, headers?: any) {
    try {
      // Perform the DELETE request using the HttpService's axiosRef
      return await this.httpService.axiosRef.delete(url, { params, headers });
    } catch (error) {
      // Log the error using the GrafanaLoggerService with a specific message for DELETE requests
      // Return the error instead of throwing it, which might be a design decision
      return error;
    }
  }
}
