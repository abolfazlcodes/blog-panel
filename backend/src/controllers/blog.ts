import { NextFunction, Response, Request } from "express";
import slugify from "slugify";
import readingTime from "reading-time";

import prisma from "../prisma.js";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import { extractPlainText } from "../utils/index.js";
import { sanitizeRichTextContent } from "../utils/sanitize-html.js";
import { deleteMediaFileById } from "./media-file.js";

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
      include: { cover_image: true }, // include relation
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
      include: { cover_image: true },
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { connect: { id: userId } },
      cover_image: cover_image ? { connect: { url: cover_image } } : undefined,
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

    const updatedContent = {
      title,
      short_description,
      description,
      content: sanitizedContent,
      cover_image,
      reading_time,
      is_featured,
      updated_at: new Date(),
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

  try {
    const allBlogs = await prisma.blog.findMany({
      where: {
        is_draft: false,
        user: {
          username,
        },
      },
      include: {
        cover_image: true,
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
    };

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: formattedBlog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLikesCountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;
  const blogId = parseInt(req.params.id);
  const username = req.params.username;
  const { likes_count } = req.body;

  try {
    // find the blog
    const blog = await prisma.blog.findUnique({
      where: {
        id: +blogId,
        userId: userId,
        user: {
          username,
        },
      },
    });

    if (!blog) {
      const error = new CustomError("No blog was found");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    const updatedContent = {
      ...blog,
      likes_count: +blog?.likes_count + likes_count,
    };

    const updatedBlog = await prisma.blog.update({
      where: {
        id: +blogId,
        userId: userId,
      },
      data: updatedContent,
    });

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
