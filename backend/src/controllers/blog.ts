import { NextFunction, Response, Request } from "express";
import slugify from "slugify";
import readingTime from "reading-time";

import prisma from "../prisma.js";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import { extractPlainText } from "../utils/index.js";
import { sanitizeRichTextContent } from "../utils/sanitize-html.js";
import { deleteMediaFileById } from "./media-file.js";
import { resolveTagConnections } from "./tags.js";
import { buildSeriesContext } from "./series.js";

// Validate that a series (when provided) belongs to the user, and normalize the
// order. Returns the numeric id to connect (or null to detach) plus the order.
async function resolveSeriesSelection(
  userId: number,
  seriesId: unknown,
  seriesOrder: unknown
): Promise<{ seriesId: number | null; series_order: number | null }> {
  if (seriesId === undefined || seriesId === null || seriesId === "") {
    return { seriesId: null, series_order: null };
  }

  const id = Number(seriesId);
  if (!Number.isInteger(id)) {
    const error = new CustomError("Invalid series selected.");
    error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
    throw error;
  }

  const series = await prisma.series.findFirst({ where: { id, userId } });
  if (!series) {
    const error = new CustomError("Selected series was not found.");
    error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
    throw error;
  }

  const orderNum = Number(seriesOrder);
  const series_order =
    seriesOrder === undefined ||
    seriesOrder === null ||
    seriesOrder === "" ||
    Number.isNaN(orderNum)
      ? null
      : orderNum;

  return { seriesId: id, series_order };
}

export const getAllBlogsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    const allBlogs = await prisma.blog.findMany({
      where: { userId: userId },
      include: {
        cover_image: true, // include relation
        series: { select: { id: true, title: true, slug: true } },
        tags: { select: { name: true } },
      },
    });

    if (!allBlogs) {
      const error = new CustomError("Something went wrong. Try again later.");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    const allBlogsFormatted = allBlogs?.map((blogItem) => ({
      id: blogItem?.id,
      title: blogItem?.title,
      short_description: blogItem?.short_description,
      description: blogItem?.description,
      slug: blogItem?.slug,
      cover_image: blogItem?.cover_image?.url || null, // get URL from MediaFile
      likes_count: blogItem?.likes_count,
      views_count: blogItem?.views_count,
      created_at: blogItem?.created_at,
      published_at: blogItem?.published_at,
      updated_at: blogItem?.updated_at,
      is_draft: blogItem?.is_draft,
      reading_time: blogItem?.reading_time,
      is_featured: blogItem?.is_featured,
      series: blogItem?.series || null,
      series_order: blogItem?.series_order,
      tags: blogItem?.tags.map((tag) => tag.name),
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: allBlogsFormatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const blogId = parseInt(req.params.id);

  try {
    // check if the blog with that id exists
    const blogDoc = await prisma.blog.findUnique({
      where: { id: blogId, userId },
      include: {
        cover_image: true,
        series: { select: { id: true, title: true, slug: true } },
        tags: { select: { name: true } },
      },
    });

    if (!blogDoc) {
      const error = new CustomError("No blog is found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const formattedBlog = {
      id: blogDoc?.id,
      slug: blogDoc?.slug,
      title: blogDoc?.title,
      short_description: blogDoc?.short_description,
      description: blogDoc?.description,
      cover_image: blogDoc.cover_image?.url || null,
      content: blogDoc?.content,
      updated_at: blogDoc?.updated_at,
      published_at: blogDoc?.published_at,
      is_draft: blogDoc?.is_draft,
      views_count: blogDoc?.views_count,
      likes_count: blogDoc?.likes_count,
      is_featured: blogDoc?.is_featured,
      seriesId: blogDoc?.seriesId,
      series: blogDoc?.series || null,
      series_order: blogDoc?.series_order,
      tags: blogDoc?.tags.map((tag) => tag.name),
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedBlog,
    });
  } catch (error) {
    next(error);
  }
};

export const createBlogHandler = async (
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
    cover_image,
    content,
    is_featured,
    tags,
  } = req.body;

  try {
    // create a slug
    const slug = slugify.default(title, {
      lower: true,
    });

    if (!slug) {
      const error = new CustomError(
        "Something went wrong. Could not create blog. Try again later."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    // check if there is already a blog with the same slug
    const isSlugAlreadyExists = await prisma.blog.findUnique({
      where: {
        slug,
      },
    });

    if (isSlugAlreadyExists) {
      const error = new CustomError(
        "Blog with the same slug already exists. Please try a different title"
      );
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    const plainText = extractPlainText(content);
    const stats = readingTime(plainText);

    const sanitizedContent = sanitizeRichTextContent(content);

    const selection = await resolveSeriesSelection(
      userId,
      req.body.seriesId,
      req.body.series_order
    );
    const tagConnections = await resolveTagConnections(userId, tags);

    // create blog content
    const newBlog = {
      title,
      slug,
      short_description,
      description,
      content: sanitizedContent,
      is_featured,
      views_count: 0,
      likes_count: 0,
      is_draft: true,
      reading_time: stats?.minutes,
      series_order: selection.series_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { connect: { id: userId } },
      cover_image: cover_image ? { connect: { url: cover_image } } : undefined,
      series: selection.seriesId
        ? { connect: { id: selection.seriesId } }
        : undefined,
      tags: tagConnections.length ? { connect: tagConnections } : undefined,
    };

    const result = await prisma.blog.create({
      data: newBlog,
      include: { cover_image: true },
    });

    if (!result) {
      const error = new CustomError(
        "Something went wrong. Could not create blog. Try again later."
      );
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusCreated).json({
      message: "Blog was created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const blogId = parseInt(req.params.id);
  const {
    title,
    short_description,
    description,
    cover_image,
    content,
    is_featured,
    tags,
  } = req.body;

  try {
    // find the blog
    const blog = await prisma.blog.findUnique({
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    if (!blog) {
      const error = new CustomError("No blog was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    let reading_time = blog.reading_time;
    if (content && content !== blog.content) {
      const plainText = extractPlainText(content);
      reading_time = readingTime(plainText).minutes;
    }

    const sanitizedContent = sanitizeRichTextContent(content);
    const oldCoverImageId = blog.cover_imageId;

    const selection = await resolveSeriesSelection(
      userId,
      req.body.seriesId,
      req.body.series_order
    );
    const tagConnections = await resolveTagConnections(userId, tags);

    const updatedContent = {
      title,
      short_description,
      description,
      content: sanitizedContent,
      cover_image,
      reading_time,
      is_featured,
      series_order: selection.series_order,
      updated_at: new Date(),
      // connect to the chosen series, or detach if none was selected
      series: selection.seriesId
        ? { connect: { id: selection.seriesId } }
        : { disconnect: true },
      // `set` replaces the full tag list; an empty array clears all tags
      tags: { set: tagConnections },
    };

    if (cover_image) {
      updatedContent.cover_image = { connect: { url: cover_image } };
    } else {
      updatedContent.cover_image = { disconnect: true }; // remove if null
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: updatedContent,
      include: { cover_image: true },
    });

    // cleanup: remove old cover if replaced
    if (oldCoverImageId && oldCoverImageId !== updatedBlog.cover_imageId) {
      await deleteMediaFileById(oldCoverImageId);
    }

    if (!updatedBlog) {
      const error = new CustomError("Could not update blog");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Blog was updated successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const publishBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const blogId = parseInt(req.params.id);
  const { is_draft } = req?.body;

  const shouldPublish = is_draft ? true : false;

  try {
    // find the blog
    const blog = await prisma.blog.findUnique({
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    if (!blog) {
      const error = new CustomError("No blog was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const updatedContent = {
      ...blog,
      is_draft: shouldPublish,
    };

    const updatedBlog = await prisma.blog.update({
      where: {
        id: +blogId,
        userId: userId,
      },
      data: updatedContent,
    });

    if (!updatedBlog) {
      const error = new CustomError("Could not publish blog");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Blog was published successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const blogId = parseInt(req.params.id);

  try {
    if (!blogId) {
      const error = new CustomError("Invalid Id.");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    // find the blog
    const blog = await prisma.blog.findUnique({
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    if (!blog) {
      const error = new CustomError("No blog was found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const coverImageId = blog.cover_imageId;

    // delete the blog
    await prisma.blog.delete({
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    // After deletion, check if the file is used elsewhere
    if (coverImageId) {
      await deleteMediaFileById(coverImageId);
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Blog was deleted successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// ------------------- public api handlers -----------------------
export const getPublishedBlogsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;
  const tagSlug =
    typeof req.query.tag === "string" ? req.query.tag : undefined;

  try {
    const allBlogs = await prisma.blog.findMany({
      where: {
        is_draft: false,
        user: {
          username,
        },
        // optional tag filter: /public/:username/blog?tag=react
        ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
      },
      orderBy: { published_at: "desc" },
      include: {
        cover_image: true,
        series: { select: { title: true, slug: true } },
        tags: { select: { name: true, slug: true } },
        user: {
          select: { username: true, first_name: true, last_name: true },
        },
      },
    });

    if (!allBlogs) {
      const error = new CustomError("Something went wrong. Try again later.");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    const formattedBlogs = allBlogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      short_description: b.short_description,
      description: b.description,
      cover_image: b.cover_image?.url || null,
      reading_time: b.reading_time,
      created_at: b.created_at,
      published_at: b.published_at,
      author: b.user.username, // include for public display
      series: b.series || null,
      tags: b.tags,
    }));

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedBlogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedSingleBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = decodeURIComponent(req.params.username);
  const blogId = Number(req.params.id);
  if (isNaN(blogId)) throw new CustomError("Invalid blog id");

  try {
    const blogDoc = await prisma.blog.findFirst({
      where: {
        id: blogId,
        is_draft: false,
        user: { username },
      },
      include: {
        cover_image: true,
        tags: { select: { name: true, slug: true } },
        user: {
          select: { username: true, first_name: true, last_name: true },
        },
      },
    });

    if (!blogDoc) {
      const error = new CustomError("No blog found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: { views_count: { increment: 1 } },
    });

    // "Part N of M" + prev/next navigation when this post belongs to a series.
    const series = await buildSeriesContext(blogDoc);

    const formattedBlog = {
      id: blogDoc.id,
      slug: blogDoc.slug,
      title: blogDoc.title,
      short_description: blogDoc.short_description,
      description: blogDoc.description,
      content: blogDoc.content,
      cover_image: blogDoc.cover_image?.url || null,
      views_count: blogDoc.views_count + 1,
      reading_time: blogDoc.reading_time,
      published_at: blogDoc.published_at,
      author: blogDoc.user.username,
      series,
      tags: blogDoc.tags,
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// Public, anonymous "like" — no auth. Increments by 1 atomically (the client
// value is not trusted) and only for a published post owned by `:username`.
export const updateLikesCountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const blogId = parseInt(req.params.id);
  const username = req.params.username;

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        is_draft: false,
        user: { username },
      },
      select: { id: true },
    });

    if (!blog) {
      const error = new CustomError("No blog was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: { likes_count: { increment: 1 } },
      select: { likes_count: true },
    });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Blog was liked successfully",
      data: { likes_count: updatedBlog.likes_count },
    });
  } catch (error) {
    next(error);
  }
};
