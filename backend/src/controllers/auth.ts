import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { IUser } from "../types/user.type.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import CustomError from "../utils/customError.js";
import { TOKEN_EXPIRY_TIME } from "../configs/constants.js";

const STATIC_USERS: IUser[] = [
  {
    id: 1,
    first_name: "Abolfazl",
    last_name: "Jamshidi",
    email: "abolfazljamshididev@gmail.com",
    password: "12345678",
  },
  {
    id: 2,
    first_name: "Arman",
    last_name: "Ahmadi",
    email: "armanahmadidev@gmail.com",
    password: "135792468",
  },
];

export const createUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const firstName = req.body?.first_name;
  const lastName = req.body?.last_name;
  const email = req.body?.email;
  const password = req.body?.password;

  try {
    // look if email/user already exists
    const isAlreadySignedUp = STATIC_USERS.find(
      (item) => item?.email === email
    );

    if (isAlreadySignedUp) {
      const error = new CustomError("User already exists.");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }

    // hash the password
    let hashedPassword;

    const result = await bcrypt.hash(password, 12);

    if (result) {
      hashedPassword = result;

      const newUser = {
        id: STATIC_USERS?.length + 1,
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
      };

      STATIC_USERS.push(newUser);

      res.status(HTTP_STATUS_CODES.StatusCreated).json({
        message: "User was created successfully",
        users: STATIC_USERS,
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
    const user = STATIC_USERS?.find((item) => item?.email === email);

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
