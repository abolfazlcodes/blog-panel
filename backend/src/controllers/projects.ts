import { NextFunction, Response, Request } from "express";
import prisma from "../prisma.js";

import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";

export const getAllProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    const allProjects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
    });

    if (!allProjects) {
      const error = new CustomError("Something went wrong. Try again later.");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: allProjects,
    });
  } catch (error) {
    next(error);
  }
};
