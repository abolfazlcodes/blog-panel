import type { IProjectCardProps } from "@/types/projects.types";
import { convertDateFormat } from "@/utils/date";

const ProjectCard: React.FC<IProjectCardProps> = ({
  title,
  cover_image,
  created_at,
  short_description,
  is_draft,
  id,
  is_featured,
  tags,
}) => {
  return (
    <article className="group hover:shadow-drop-down transition-all duration-300 hover:-translate-y-2 w-full bg-white rounded-lg shadow-card overflow-hidden p-6">
      <a href={`/update-project/${id}`} className="flex flex-col gap-y-8">
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
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-success/10 text-success text-d-caption rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
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

export default ProjectCard;
