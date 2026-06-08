import { NextFunction, Response, Request } from "express";
import slugify from "slugify";

import prisma from "../prisma.js";

import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import { sanitizeRichTextContent } from "../utils/sanitize-html.js";
import { deleteMediaFileById } from "./media-file.js";
import { resolveTagConnections } from "./tags.js";
import {
  buildPaginationMeta,
  buildSearchFilter,
  parsePagination,
} from "../utils/pagination.js";

export const getAllProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const pagination = parsePagination(req);
  const where = { userId, ...buildSearchFilter(req.query.q) };

  try {
    const [allProjects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          cover_image: true,
          tags: { select: { name: true } },
        },
        orderBy: { updated_at: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.project.count({ where }),
    ]);

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
      is_featured: item?.is_featured,
      tags: item?.tags.map((tag) => tag.name),
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProjects,
      meta: buildPaginationMeta(total, pagination),
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
      include: {
        cover_image: true,
        tags: { select: { name: true } },
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
      cover_image: projectDoc.cover_image?.url || null,
      content: projectDoc?.content,
      updated_at: projectDoc?.updated_at,
      published_at: projectDoc?.published_at,
      is_draft: projectDoc?.is_draft,
      is_featured: projectDoc?.is_featured,
      tags: projectDoc?.tags.map((tag) => tag.name),
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
  const {
    title,
    short_description,
    description,
    content,
    cover_image,
    is_featured,
    tags,
  } = req.body;

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

    const sanitizedContent = sanitizeRichTextContent(content);
    const tagConnections = await resolveTagConnections(userId, tags);

    const newProject = {
      title,
      slug,
      short_description,
      description,
      content: sanitizedContent,
      is_featured,
      is_draft: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { connect: { id: userId } },
      cover_image: cover_image ? { connect: { url: cover_image } } : undefined,
      tags: tagConnections.length ? { connect: tagConnections } : undefined,
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
  const {
    title,
    short_description,
    description,
    content,
    cover_image,
    is_featured,
    tags,
  } = req.body;

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

    const sanitizedContent = sanitizeRichTextContent(content);
    const oldCoverImageId = projectDoc.cover_imageId;
    const tagConnections = await resolveTagConnections(userId, tags);

    const updatedContent = {
      title,
      short_description,
      description,
      content: sanitizedContent,
      cover_image,
      is_featured,
      updated_at: new Date(),
      // `set` replaces the full tag list; an empty array clears all tags
      tags: { set: tagConnections },
    };

    if (cover_image) {
      updatedContent.cover_image = { connect: { url: cover_image } };
    } else {
      updatedContent.cover_image = { disconnect: true }; // remove if null
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: +projectId,
      },
      data: updatedContent,
      include: { cover_image: true },
    });

    // cleanup: remove old cover if replaced
    if (oldCoverImageId && oldCoverImageId !== updatedProject.cover_imageId) {
      await deleteMediaFileById(oldCoverImageId);
    }

    if (!updatedProject) {
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
  const { is_draft } = req?.body;

  const shouldPublish = is_draft ? true : false;

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
      is_draft: shouldPublish,
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

    const coverImageId = projectDoc.cover_imageId;

    // delete the project
    await prisma.project.delete({
      where: {
        id: +projectId,
        userId: userId,
      },
    });

    // After deletion, check if the file is used elsewhere
    if (coverImageId) {
      await deleteMediaFileById(coverImageId);
    }

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
  const tagSlug =
    typeof req.query.tag === "string" ? req.query.tag : undefined;
  const pagination = parsePagination(req);

  const where = {
    is_draft: false,
    user: { username },
    // optional tag filter: /public/:username/project?tag=react
    ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
    // optional full-text search: ?q=...
    ...buildSearchFilter(req.query.q),
  };

  try {
    const [allPublishedProjects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { published_at: "desc" },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          cover_image: true,
          tags: { select: { name: true, slug: true } },
          user: true,
        },
      }),
      prisma.project.count({ where }),
    ]);

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
      tags: item.tags,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProjects,
      meta: buildPaginationMeta(total, pagination),
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
      include: {
        cover_image: true,
        tags: { select: { name: true, slug: true } },
        user: true,
      },
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
      tags: projectDoc.tags,
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedProject,
    });
  } catch (error) {
    next(error);
  }
};
