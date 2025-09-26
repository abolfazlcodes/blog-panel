import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import CustomError from "../utils/customError.js";
import { TOKEN_EXPIRY_TIME } from "../configs/constants.js";
import prisma from "../prisma.js";

export const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const isAlreadySignedUp = await prisma.user.findUnique({
      where: { email },
    });

    if (isAlreadySignedUp) {
      const error = new CustomError("User already exists.");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }

    // hash the password
    let hashedPassword;

    const result = await bcrypt.hash(password, 12);
    const username = `${first_name?.toLowerCase()}_${last_name?.toLowerCase()}_`;

    if (result) {
      hashedPassword = result;

      const newUser = {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        username: username,
        created_at: new Date().toISOString(),
      };

      const createdUser = await prisma.user.create({
        data: newUser,
      });

      if (!createdUser) {
        const error = new CustomError(
          "Something went wrong. Could not create user. Try again later."
        );
        error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
        throw error;
      }

      res.status(HTTP_STATUS_CODES.StatusCreated).json({
        message: "User was created successfully",
      });
    } else {
      const error = new CustomError(
        "Something went wrong. Please try again later"
      );
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req?.body?.email;
  const plainPassword = req.body?.password;

  try {
    // look up for the user email in db
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      const error = new CustomError("Email or password is wrong!");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const isMatch = await bcrypt.compare(plainPassword, user?.password);

    if (isMatch) {
      // create token for the user
      const token = jwt.sign(
        {
          userId: user?.id,
          email: user?.email,
        },
        process.env.JWT_SECRET_KEY!,
        {
          expiresIn: TOKEN_EXPIRY_TIME,
          algorithm: "HS256",
        }
      );

      res.status(200).json({
        message: "login was successful",
        token,
        expiresAt: new Date(
          Date.now() + TOKEN_EXPIRY_TIME * 1000
        ).toISOString(),
      });
    } else {
      const error = new CustomError("Email or password is wrong!");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
