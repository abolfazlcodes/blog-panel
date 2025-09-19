import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user.type.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";
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
export const loginHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req?.body?.email;

  try {
    // look up for the user email in db
    const user = STATIC_USERS?.find((item) => item?.email === email);

    if (!user) {
      const error = new CustomError("Email or password is wrong!");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

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
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_TIME * 1000).toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
