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
      include: { cover_image: true },
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
      cover_image: item?.cover_image?.url || null, // get URL from MediaFile
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
      include: { cover_image: true },
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
      cover_image: projectDoc.cover_image?.url || null,
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
      content,
      is_draft: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { connect: { id: userId } },
      cover_image: cover_image ? { connect: { id: cover_image } } : undefined,
    };

    const result = await prisma.project.create({
      data: newProject,
      include: { cover_image: true },
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

export const updateProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const projectId = parseInt(req.params.id);
  const { title, short_description, description, content, cover_image } =
    req.body;

  try {
    // find the project
    const projectDoc = await prisma.project.findUnique({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    if (!projectDoc) {
      const error = new CustomError("No project was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const updatedContent = {
      title,
      short_description,
      description,
      content,
      cover_image,
      updated_at: new Date(),
    };

    if (cover_image) {
      updatedContent.cover_image = { connect: { id: cover_image } };
    } else {
      updatedContent.cover_image = { disconnect: true }; // remove if null
    }

    const updatedBlog = await prisma.project.update({
      where: {
        id: +projectId,
      },
      data: updatedContent,
      include: { cover_image: true },
    });

    if (!updatedBlog) {
      const error = new CustomError("Could not update project");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Project was updated successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const publishProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const projectId = parseInt(req.params.id);

  try {
    // find the project
    const project = await prisma.project.findUnique({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    if (!project) {
      const error = new CustomError("No project was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const updatedContent = {
      ...project,
      is_draft: false,
    };

    const updatedProject = await prisma.project.update({
      where: {
        id: +projectId,
        userId: userId,
      },
      data: updatedContent,
    });

    if (!updatedProject) {
      const error = new CustomError("Could not publish project document");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Project was published successfully",
      data: [],
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

// -------------------- public api handlers -------------------------
export const getPublishedProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;

  try {
    const allPublishedProjects = await prisma.project.findMany({
      where: {
        is_draft: false,
        user: {
          username,
        },
      },
      include: {
        cover_image: true,
        user: true,
      },
    });

    if (!allPublishedProjects) {
      const error = new CustomError("Something went wrong. Try again later.");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    const formattedProjects = allPublishedProjects.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      short_description: item.short_description,
      description: item.description,
      cover_image: item.cover_image?.url || null, // use relation
      content: item.content,
      updated_at: item.updated_at,
      published_at: item.published_at,
      is_draft: item.is_draft,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProjects,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedSingleProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;
  const projectId = parseInt(req.params.id);

  try {
    const projectDoc = await prisma.project.findFirst({
      where: {
        id: projectId,
        is_draft: false,
        user: { username },
      },
      include: { cover_image: true, user: true },
    });

    if (!projectDoc) {
      const error = new CustomError("No project is found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const formattedProject = {
      id: projectDoc.id,
      slug: projectDoc.slug,
      title: projectDoc.title,
      short_description: projectDoc.short_description,
      description: projectDoc.description,
      cover_image: projectDoc.cover_image?.url || null,
      content: projectDoc.content,
      updated_at: projectDoc.updated_at,
      published_at: projectDoc.published_at,
      is_draft: projectDoc.is_draft,
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProject,
    });
  } catch (error) {
    next(error);
  }
};
