import { NextFunction, Response, Request } from "express";

import prisma from "../prisma.js";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import { toSlug } from "../utils/slug.js";

/**
 * Upsert the given tag names for a user and return a relation-connect list.
 * Names are de-duplicated by slug; blank/invalid names are skipped. Pass the
 * result to Prisma's `tags: { set: [...] }` on a blog or project.
 */
export async function resolveTagConnections(
  userId: number,
  names: unknown
): Promise<{ id: number }[]> {
  if (!Array.isArray(names)) return [];

  // slug -> display name (first occurrence wins, so "React" beats a later "react")
  const bySlug = new Map<string, string>();
  for (const raw of names) {
    if (typeof raw !== "string") continue;
    const name = raw.trim();
    const slug = toSlug(name);
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, name);
  }

  const connections: { id: number }[] = [];
  for (const [slug, name] of bySlug) {
    const tag = await prisma.tag.upsert({
      where: { userId_slug: { userId, slug } },
      create: { name, slug, userId },
      update: {}, // keep the existing display name when the tag is re-used
    });
    connections.push({ id: tag.id });
  }
  return connections;
}

export const getAllTagsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { blogs: true, projects: true } } },
    });

    const formatted = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      blogs_count: tag._count.blogs,
      projects_count: tag._count.projects,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const createTagHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const { name } = req.body;

  try {
    const slug = toSlug(name);
    if (!slug) {
      const error = new CustomError("Tag name is invalid.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const existing = await prisma.tag.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) {
      const error = new CustomError("A tag with that name already exists.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), slug, userId },
    });

    res.status(HTTP_STATUS_CODES.StatusCreated).json({
      message: "Tag was created successfully",
      data: { id: tag.id, name: tag.name, slug: tag.slug },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTagHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const tagId = parseInt(req.params.id);
  const { name } = req.body;

  try {
    const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) {
      const error = new CustomError("No tag was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const slug = toSlug(name);
    if (!slug) {
      const error = new CustomError("Tag name is invalid.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    // Renaming onto an existing tag's slug would violate the unique constraint.
    const clash = await prisma.tag.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (clash && clash.id !== tagId) {
      const error = new CustomError("A tag with that name already exists.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: { name: name.trim(), slug },
    });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Tag was updated successfully",
      data: { id: updated.id, name: updated.name, slug: updated.slug },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTagHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const tagId = parseInt(req.params.id);

  try {
    const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) {
      const error = new CustomError("No tag was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    // Join-table rows are removed automatically (FK ON DELETE CASCADE); the
    // blogs/projects themselves are untouched.
    await prisma.tag.delete({ where: { id: tagId } });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Tag was deleted successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- public api handler -----------------------
// Lists a user's tags that are attached to at least one *published* item, with
// published-only usage counts — handy for a public tag cloud / filter UI.
export const getPublicTagsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;

  try {
    const tags = await prisma.tag.findMany({
      where: {
        user: { username },
        OR: [
          { blogs: { some: { is_draft: false } } },
          { projects: { some: { is_draft: false } } },
        ],
      },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            blogs: { where: { is_draft: false } },
            projects: { where: { is_draft: false } },
          },
        },
      },
    });

    const formatted = tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      blogs_count: tag._count.blogs,
      projects_count: tag._count.projects,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
