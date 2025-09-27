import { AxiosError } from "axios";

export interface ApiErrorParams {
  message: string;
  statusCode?: number;
  responseMessage?: string;
}

interface ErrorResponseData {
  message?: string;
}

export class ApiError extends Error {
  statusCode?: number;
  responseMessage?: string;

  constructor({ message, statusCode, responseMessage }: ApiErrorParams) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseMessage = responseMessage;
  }
}

export const errorHandler = (error: AxiosError<ErrorResponseData>): never => {
  const statusCode = error.response?.status;
  const responseMessage =
    error.response?.data?.message || "Unknown error occurred";

  let customMessage = "Unknown error occurred";

  switch (statusCode) {
    case 400:
      customMessage = "Wrong input formats. Please provide valid data";
      break;
    case 401:
      customMessage = "Not authorized. Please login";
      break;
    case 403:
      customMessage = "Access denied. You are not allowed to be here";
      break;
    case 404:
      customMessage = "Not found. The resource is missing";
      break;
    case 500:
      customMessage = "Internal server error. Please try again later";
      break;
    case 503:
      customMessage = "Server Gate away. Please try again later";
      break;
    default:
      customMessage = responseMessage;
  }

  throw new ApiError({
    message: customMessage,
    statusCode,
    responseMessage,
  });
};
