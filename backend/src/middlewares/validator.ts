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
    const errorsArrayData = errors?.array();
    const errorsMap = new Map();

    errorsArrayData?.map((item) => {
      const errorExists = errorsMap?.get(item?.path);

      if (errorExists) {
        errorExists.push(item?.msg);
      } else {
        errorsMap.set(item?.path, [item?.msg]);
      }
    });

    return res.status(HTTP_STATUS_CODES.StatusUnprocessableEntity).json({
      message: "Wrong Data Format",
      description: "One or some part of the request are unprocessable",
      status: HTTP_STATUS_CODES.StatusUnprocessableEntity,
      errors: Object.fromEntries(errorsMap),
    });
  }

  next();
};
