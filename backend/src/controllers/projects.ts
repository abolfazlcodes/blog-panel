import { NextFunction, Response, Request } from "express";
import slugify from "slugify";

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

    const formattedProjects = allProjects?.map((item) => ({
      id: item?.id,
      title: item?.title,
      short_description: item?.short_description,
      description: item?.description,
      slug: item?.slug,
      is_draft: item?.is_draft,
      updated_at: item?.updated_at,
      published_at: item?.published_at,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProjects,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = parseInt(req.params.id);
  // @ts-ignore
  const userId = req?.userId;

  try {
    // check if the project with that id exists
    const projectDoc = await prisma.project.findUnique({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    if (!projectDoc) {
      const error = new CustomError("No project is found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const formattedProject = {
      id: projectDoc?.id,
      slug: projectDoc?.slug,
      title: projectDoc?.title,
      short_description: projectDoc?.short_description,
      description: projectDoc?.description,
      cover_image: projectDoc?.cover_image,
      content: projectDoc?.content,
      updated_at: projectDoc?.updated_at,
      published_at: projectDoc?.published_at,
      is_draft: projectDoc?.is_draft,
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const createProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  const { title, short_description, description, content, cover_image } =
    req.body;

  try {
    const slug = slugify.default(title, {
      lower: true,
    });

    if (!slug) {
      const error = new CustomError(
        "Something went wrong. Could not create slug. Try again later."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    // check if slug already exists
    const isSlugAlreadyExists = await prisma.project.findUnique({
      where: {
        slug,
      },
    });

    if (isSlugAlreadyExists) {
      const error = new CustomError(
        "Project with the same slug already exists. Please try a different title"
      );
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const newProject = {
      title,
      slug,
      short_description,
      description,
      cover_image,
      content,
      is_draft: true,
      userId: userId, // the logged in userId
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await prisma.project.create({
      data: newProject,
    });

    if (!result) {
      const error = new CustomError(
        "Something went wrong. Could not create project. Try again later."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusCreated).json({
      message: "Project was created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = parseInt(req.params.id);
  // @ts-ignore
  const userId = req?.userId;

  try {
    if (!projectId) {
      const error = new CustomError("Invalid Id.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    // find the project doc
    const projectDoc = await prisma.project.findUnique({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    if (!projectDoc) {
      const error = new CustomError("No project document was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    // delete the project
    await prisma.project.delete({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Document was deleted successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};
