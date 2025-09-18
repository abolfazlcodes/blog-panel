import { LucideEllipsis, LucideHand, LucideMessageSquare } from "lucide-react";

const BlogCard = () => {
  return (
    <a
      href="#"
      className="flex w-full h-full gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      {/* Left content */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-sans font-bold text-lg md:text-xl leading-snug mb-2 line-clamp-2">
            Revolutionize Loading UX with React 18: Suspense, Streaming &
            Selective Hydration
          </h2>
          <p className="text-sm md:text-base text-gray-600 line-clamp-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Consequuntur cumque aliquam enim doloribus distinctio amet...
          </p>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-5">
            <span>Nov 15, 2023</span>
            <span className="flex items-center gap-1">
              182
              <LucideHand className="w-4 h-4 fill-gray-400 stroke-none -rotate-12" />
            </span>
            <span className="flex items-center gap-1">
              3
              <LucideMessageSquare className="w-4 h-4 fill-gray-400 stroke-none" />
            </span>
          </div>
          <LucideEllipsis className="w-5 h-5 stroke-gray-400" />
        </div>
      </div>

      {/* Right image */}
      <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src="/sample.jpg"
          alt="Blog preview"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </a>
  );
};

export default BlogCard;
