import { NextFunction, Response, Request } from "express";
import slugify from "slugify";

import prisma from "../prisma.js";
import CustomError from "../utils/customError.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";

export const getAllBlogsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req?.userId;

  try {
    const allBlogs = await prisma.blog.findMany({
      where: {
        userId: userId,
      },
    });

    if (!allBlogs) {
      const error = new CustomError("Something went wrong. Try again later.");
      error.statusCode = HTTP_STATUS_CODES.StatusInternalServerError;
      throw error;
    }

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "successful",
      data: allBlogs,
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
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    if (!blogDoc) {
      const error = new CustomError("No blog is found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    // update views_count whenever the id of this blog is hit
    const updatedBlog = await prisma.blog.update({
      where: {
        id: +blogId,
      },
      data: {
        views_count: blogDoc?.views_count + 1,
      },
    });

    const formattedBlog = {
      id: updatedBlog?.id,
      slug: updatedBlog?.slug,
      title: updatedBlog?.title,
      short_description: updatedBlog?.short_description,
      description: updatedBlog?.description,
      cover_image: updatedBlog?.cover_image,
      content: updatedBlog?.content,
      updated_at: updatedBlog?.updated_at,
      published_at: updatedBlog?.published_at,
      is_draft: updatedBlog?.is_draft,
      views_count: updatedBlog?.views_count,
      likes_count: updatedBlog?.likes_count,
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

  const { title, short_description, description, cover_image, content } =
    req.body;

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

    // create blog content
    const newBlog = {
      title,
      slug,
      short_description,
      description,
      content,
      cover_image,
      views_count: 0,
      likes_count: 0,
      is_draft: true,
      userId: userId, // the logged in userId
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await prisma.blog.create({
      data: newBlog,
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
  const { title, short_description, description, cover_image, content } =
    req.body;

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
      title,
      short_description,
      description,
      content,
      cover_image,
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

    // delete the blog
    await prisma.blog.delete({
      where: {
        id: +blogId,
        userId: userId,
      },
    });

    res.status(HTTP_STATUS_CODES.StatusOk).json({
      message: "Blog was deleted successfully",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};
