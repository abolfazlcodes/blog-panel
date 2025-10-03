import type { IBlogsCardProps } from "@/types/blogs.types";
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
}) => {
  return (
    <article className="group hover:shadow-drop-down transition-all duration-300 hover:-translate-y-2 w-full bg-white rounded-lg shadow-card overflow-hidden p-6">
      <a href={`/update-blog/${id}`} className="flex flex-col gap-y-8">
        <figure className="relative">
          <img
            src={
              cover_image ||
              "https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            className="relative border-none outline-none rounded-lg object-cover object-center h-56 w-full z-10"
          />

          {/* image overlay */}
          <div className="absolute bg-success-lighter w-[102%] h-full top-1 rounded-lg -left-2 -rotate-6 " />
        </figure>

        <div className="flex items-center gap-2">
          <span className="bg-success-lighter text-success text-m-body2 flex items-center justify-center text-center w-max py-2 px-4 uppercase">
            featured
          </span>
          <span className="bg-error-lighter text-error text-m-body2 flex items-center justify-center text-center w-max py-2 px-4 uppercase">
            {is_draft ? "not published" : "published"}
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
                <span>2 min read</span>
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
