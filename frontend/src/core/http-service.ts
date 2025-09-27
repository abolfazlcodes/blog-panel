import axios from "axios";
import Cookies from "js-cookie";

import { errorHandler } from "./error-handler";
import ValidationError from "./validation-errors";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const httpService = axios.create({
  baseURL: API_URL,
});

httpService.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpService.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    const token = Cookies.get("auth_token");
    if (error?.response) {
      const statusCode = error.response?.status;
      if (statusCode === 422) {
        throw new ValidationError(error.response.data);
      } else if (statusCode >= 400) {
        if (statusCode === 401) {
          Cookies.remove("auth_token");
          if (token) {
            window.location.reload();
          }
        }
      }
      errorHandler(error);
    }
  }
);

export const readData = httpService.get;
export const createData = httpService.post;
export const updateData = httpService.put;
export const updateDataPartially = httpService.patch;
export const deleteData = httpService.delete;
