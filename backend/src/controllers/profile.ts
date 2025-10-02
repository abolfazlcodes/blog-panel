import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import prisma from "../prisma.js";

export const getUserProfileData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    if (!userId) {
      const error = new CustomError("No user was found");
      error.statusCode = HTTP_STATUS_CODES.StatusBadGateway;
      throw error;
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const userData = {
      name: `${foundUser?.first_name} ${foundUser?.last_name}`,
      email: foundUser?.email,
      username: foundUser?.username,
    };

    if (!foundUser) {
      const error = new CustomError("Unauthorized");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Request was successful",
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};
