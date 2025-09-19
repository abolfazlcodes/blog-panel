import HTTP_STATUS_CODES from "./statusCodes.js";

class CustomError extends Error {
  statusCode: number;

  constructor(errorMessage: string) {
    super();
    this.message = errorMessage;
    this.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
  }
}

export default CustomError;
