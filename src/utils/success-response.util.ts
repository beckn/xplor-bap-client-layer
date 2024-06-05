// This function formats a successful response object.
// It takes the data to be returned and a message from the HttpResponseMessge enum.
// It returns an object with a success flag, the provided message, and the data.

import { HttpResponseMessage } from '../common/constants/error-message';

export const getSuccessResponse = (data: any, message: HttpResponseMessage): any => {
  return {
    success: true,
    message,
    data,
  };
};
