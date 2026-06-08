import { NextFunction, Response, Request } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../prisma.js";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import { toSlug } from "../utils/slug.js";

// Order siblings within a series: author-assigned order first (nulls last),
// then id as a stable tie-breaker. Shared by every series read path.
const SERIES_ORDER: Prisma.BlogOrderByWithRelationInput[] = [
  { series_order: { sort: "asc", nulls: "last" } },
  { id: "asc" },
];

/**
 * Build the "Part N of M" navigation context for a published blog that belongs
 * to a series. Returns null when the blog has no series. Only *published*
 * siblings are counted/listed, so the public numbering is gap-free.
 */
export async function buildSeriesContext(blog: {
  id: number;
  seriesId: number | null;
}) {
  if (!blog.seriesId) return null;

  const series = await prisma.series.findUnique({
    where: { id: blog.seriesId },
  });
  if (!series) return null;

  const siblings = await prisma.blog.findMany({
    where: { seriesId: blog.seriesId, is_draft: false },
    orderBy: SERIES_ORDER,
    select: { id: true, title: true, slug: true },
  });

  const index = siblings.findIndex((s) => s.id === blog.id);
  const parts = siblings.map((s, i) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    order: i + 1,
    is_current: s.id === blog.id,
  }));

  const neighbor = (s: (typeof siblings)[number]) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
  });

  return {
    id: series.id,
    title: series.title,
    slug: series.slug,
    description: series.description,
    part: index >= 0 ? index + 1 : null,
    total: siblings.length,
    parts,
    prev: index > 0 ? neighbor(siblings[index - 1]) : null,
    next:
      index >= 0 && index < siblings.length - 1
        ? neighbor(siblings[index + 1])
        : null,
  };
}

export const getAllSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    const series = await prisma.series.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
      include: { _count: { select: { blogs: true } } },
    });

    const formatted = series.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
      blogs_count: item._count.blogs,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const seriesId = parseInt(req.params.id);

  try {
    const series = await prisma.series.findFirst({
      where: { id: seriesId, userId },
      include: {
        blogs: {
          orderBy: SERIES_ORDER,
          select: {
            id: true,
            title: true,
            slug: true,
            series_order: true,
            is_draft: true,
          },
        },
      },
    });

    if (!series) {
      const error = new CustomError("No series was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: {
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        created_at: series.created_at,
        updated_at: series.updated_at,
        blogs: series.blogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const { title, description } = req.body;

  try {
    const slug = toSlug(title);
    if (!slug) {
      const error = new CustomError("Series title is invalid.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const existing = await prisma.series.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) {
      const error = new CustomError(
        "A series with the same title already exists. Please use a different title."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const series = await prisma.series.create({
      data: { title: title.trim(), slug, description: description || null, userId },
    });

    res.status(HTTP_STATUS_CODES.StatusCreated).json({
      message: "Series was created successfully",
      data: { id: series.id, title: series.title, slug: series.slug },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const seriesId = parseInt(req.params.id);
  const { title, description } = req.body;

  try {
    const series = await prisma.series.findFirst({
      where: { id: seriesId, userId },
    });
    if (!series) {
      const error = new CustomError("No series was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const slug = toSlug(title);
    if (!slug) {
      const error = new CustomError("Series title is invalid.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const clash = await prisma.series.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (clash && clash.id !== seriesId) {
      const error = new CustomError(
        "A series with the same title already exists. Please use a different title."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const updated = await prisma.series.update({
      where: { id: seriesId },
      data: { title: title.trim(), slug, description: description ?? null },
    });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Series was updated successfully",
      data: { id: updated.id, title: updated.title, slug: updated.slug },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const seriesId = parseInt(req.params.id);

  try {
    const series = await prisma.series.findFirst({
      where: { id: seriesId, userId },
    });
    if (!series) {
      const error = new CustomError("No series was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    // Member blogs keep existing; their seriesId is set NULL via the FK rule.
    await prisma.series.delete({ where: { id: seriesId } });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Series was deleted successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- public api handler -----------------------
// Returns a series with its ordered, published parts — lets a consumer render a
// series landing page at /public/:username/series/:slug.
export const getPublicSeriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;
  const slug = req.params.slug;

  try {
    const series = await prisma.series.findFirst({
      where: { slug, user: { username } },
      include: {
        blogs: {
          where: { is_draft: false },
          orderBy: SERIES_ORDER,
          include: { cover_image: true },
        },
      },
    });

    if (!series) {
      const error = new CustomError("No series was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const parts = series.blogs.map((blog, index) => ({
      part: index + 1,
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      short_description: blog.short_description,
      description: blog.description,
      cover_image: blog.cover_image?.url || null,
      reading_time: blog.reading_time,
      published_at: blog.published_at,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: {
        id: series.id,
        title: series.title,
        slug: series.slug,
        description: series.description,
        total: parts.length,
        parts,
      },
    });
  } catch (error) {
    next(error);
  }
};
