import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import slugify from "slugify";

import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import CustomError from "../utils/customError.js";
import prisma from "../prisma.js";
import {
  consumeRefreshToken,
  createAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
} from "../utils/tokens.js";

/** Builds a URL-safe, unique username from the user's name. */
async function generateUniqueUsername(first: string, last: string) {
  const base =
    slugify.default(`${first} ${last}`, { lower: true, strict: true }) || "user";
  let username = base;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}-${suffix++}`;
  }
  return username;
}

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
    const username = await generateUniqueUsername(first_name, last_name);

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
      error.statusCode = HTTP_STATUS_CODES.StatusUnprocessableEntity;
      throw error;
    }

    const isMatch = await bcrypt.compare(plainPassword, user?.password);

    if (isMatch) {
      const access = createAccessToken({ id: user.id, email: user.email });
      const refresh = await issueRefreshToken(user.id);

      res.status(200).json({
        message: "login was successful",
        token: access.token,
        expiresAt: access.expiresAt.toISOString(),
        refreshToken: refresh.token,
        refreshExpiresAt: refresh.expiresAt.toISOString(),
      });
    } else {
      const error = new CustomError("Email or password is wrong!");
      error.statusCode = HTTP_STATUS_CODES.StatusUnprocessableEntity;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Exchange a valid refresh token for a fresh access token + rotated refresh
// token. The presented refresh token is consumed (single-use).
export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  try {
    const userId = await consumeRefreshToken(refreshToken);

    if (!userId) {
      const error = new CustomError("Invalid or expired refresh token.");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new CustomError("Invalid or expired refresh token.");
      error.statusCode = HTTP_STATUS_CODES.StatusUnauthorized;
      throw error;
    }

    const access = createAccessToken({ id: user.id, email: user.email });
    const refresh = await issueRefreshToken(user.id);

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "token refreshed",
      token: access.token,
      expiresAt: access.expiresAt.toISOString(),
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Revoke a refresh token (logout). Always succeeds so the client can clear state.
export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.status(HTTP_STATUS_CODES.StatusOk).json({ message: "logged out" });
  } catch (error) {
    next(error);
  }
};
