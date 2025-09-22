import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";

export const isAuthenticatedValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new CustomError("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1]; // get the token;

  if (!token) {
    const error = new CustomError("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!);
  } catch (error) {
    const err = new CustomError("Could not verify user. Not authorized");
    err.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
    throw err;
  }

  if (!decodedToken) {
    const error = new CustomError("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  // @ts-ignore
  req.userId = decodedToken?.userId; // we set userId as claim when creating the token

  next();
};
