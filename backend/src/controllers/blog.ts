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
      views_count: 0,
      likes_count: 0,
      is_draft: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { connect: { id: userId } },
      cover_image: cover_image ? { connect: { id: cover_image } } : undefined,
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

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: updatedContent,
      include: { cover_image: true },
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

export const getPublishedSingleBlogHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.params.username;
  const blogId = parseInt(req.params.id);

  try {
    // check if the blog with that id exists
    const blogDoc = await prisma.blog.findUnique({
      where: {
        id: +blogId,
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

    if (!blogDoc || blogDoc.is_draft || blogDoc.user.username !== username) {
      const error = new CustomError("No blog is found.");
      error.statusCode = HTTP_STATUS_CODES.StatusNotFound;
      throw error;
    }

    // update views_count whenever the id of this blog is hit
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { views_count: blogDoc.views_count + 1 },
      include: { cover_image: true },
    });

    const formattedBlog = {
      id: updatedBlog?.id,
      slug: updatedBlog?.slug,
      title: updatedBlog?.title,
      short_description: updatedBlog?.short_description,
      description: updatedBlog?.description,
      cover_image: updatedBlog.cover_image?.url || null,
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
