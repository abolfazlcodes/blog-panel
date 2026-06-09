import type { IBlogsCardProps } from "@/types/blogs.types";
import { displayBlogReadingTime } from "@/utils";
import { convertDateFormat } from "@/utils/date";
import { Eye, Heart } from "lucide-react";

const BlogCard: React.FC<IBlogsCardProps> = ({
  title,
  cover_image,
  created_at,
  short_description,
  is_draft,
  likes_count,
  id,
  views_count,
  reading_time,
  is_featured,
  tags,
}) => {
  return (
    <article className="group hover:shadow-drop-down transition-all duration-300 hover:-translate-y-2 w-full bg-white rounded-lg shadow-card overflow-hidden p-6">
      <a href={`/update-blog/${id}`} className="flex flex-col gap-y-8">
        <figure className="relative">
          <img
            src={cover_image || "/image-placeholder.jpg"}
            className="relative border-none outline-none rounded-lg object-cover object-center h-56 w-full z-10"
          />

          {/* image overlay */}
          <div className="absolute bg-success-lighter w-[102%] h-full top-1 rounded-lg -left-2 -rotate-6 " />
        </figure>

        <div className="flex items-center gap-2">
          {is_featured && (
            <span className="bg-success-lighter text-success text-d-caption flex w-max items-center justify-center rounded-full px-3 py-1 font-semibold uppercase">
              featured
            </span>
          )}
          <span
            className={`text-d-caption flex w-max items-center justify-center rounded-full px-3 py-1 font-semibold uppercase ${
              is_draft
                ? "bg-warning-lighter text-warning"
                : "bg-success-lighter text-success"
            }`}
          >
            {is_draft ? "draft" : "published"}
          </span>
        </div>

        <div className="h-full flex-1 min-h-32 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-d-body1 line-clamp-2 font-medium text-primary-text">
              {title}
            </h2>

            <p className="text-m-body2 text-secondary-text">
              {short_description}
            </p>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-success/10 text-success text-d-caption rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-secondary-text text-d-caption gap-1">
                <Eye size={16} />
                <span>{views_count}</span>
              </div>

              <div className="flex items-center text-secondary-text text-d-caption gap-1">
                <Heart size={16} />
                <span>{likes_count}</span>
              </div>
              {/* //todo: for showing the count for comment on the blog for future */}
              {/* <div className="flex items-center text-secondary-text text-d-caption gap-1">
                <MessageCircle size={16} />
                <span>4</span>
              </div> */}

              <span className="text-secondary-text text-d-caption">|</span>

              <div className="flex items-center text-secondary-text text-d-caption gap-1">
                <span>{displayBlogReadingTime(reading_time)} min read</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-secondary-text text-d-caption">
                {convertDateFormat(created_at)}
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};

export default BlogCard;
