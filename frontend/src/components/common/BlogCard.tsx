import type { IBlogsCardProps } from "@/types/blogs.types";
import { customTwMerge } from "@/utils/custom-tailwind-merge";
import { convertDateFormat } from "@/utils/date";
import { LucideEllipsis, LucideHand, LucideMessageSquare } from "lucide-react";

const BlogCard: React.FC<IBlogsCardProps> = ({
  title,
  cover_image,
  created_at,
  description,
  is_draft,
  likes_count,
  slug,
  views_count,
}) => {
  return (
    <a
      href={`/update-blog/${slug}`}
      className={customTwMerge(
        "flex w-full h-full gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors",
        is_draft && "opacity-50"
      )}
    >
      {/* Left content */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-sans font-bold text-lg md:text-xl leading-snug mb-2 line-clamp-2">
            {title}
          </h2>
          <p className="text-sm md:text-base text-gray-600 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-5">
            <span>{convertDateFormat(created_at)}</span>

            <span className="flex items-center gap-1">
              {views_count}
              <LucideHand className="w-4 h-4 fill-gray-400 stroke-none -rotate-12" />
            </span>

            <span className="flex items-center gap-1">
              {likes_count}
              <LucideMessageSquare className="w-4 h-4 fill-gray-400 stroke-none" />
            </span>
          </div>
          <LucideEllipsis className="w-5 h-5 stroke-gray-400" />
        </div>
      </div>

      {/* Right image */}
      <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={cover_image}
          alt={`image of ${title}`}
          className="w-full h-full object-cover object-center"
        />
      </div>
    </a>
  );
};

export default BlogCard;
