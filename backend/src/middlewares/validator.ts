import { NextFunction, Request, Response } from "express";
import { Result, validationResult } from "express-validator";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";

export const errorValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: Result = validationResult(req);

  if (!errors?.isEmpty()) {
    return res.status(HTTP_STATUS_CODES.StatusBadRequest).json({
      message: "Wrong Data Format",
      errors: errors?.array()?.map((errItem) => ({
        field: errItem?.path,
        message: errItem?.msg,
      })),
    });
  }

  next();
};
