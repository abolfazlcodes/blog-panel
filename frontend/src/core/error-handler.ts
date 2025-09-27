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
    error.response?.data?.message || "خطای ناشناخته رخ داده است";

  let customMessage = "یک خطای غیرمنتظره رخ داد.";

  switch (statusCode) {
    case 400:
      customMessage = "درخواست نامعتبر است. لطفاً ورودی‌های خود را بررسی کنید.";
      break;
    case 401:
      customMessage = "شما احراز هویت نشده‌اید. لطفاً وارد شوید.";
      break;
    case 403:
      customMessage = "دسترسی غیرمجاز. شما به این منبع دسترسی ندارید.";
      break;
    case 404:
      customMessage = "منبع مورد نظر یافت نشد.";
      break;
    case 500:
      customMessage = "خطای داخلی سرور. لطفاً بعداً دوباره تلاش کنید.";
      break;
    case 503:
      customMessage = "سرویس در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.";
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
