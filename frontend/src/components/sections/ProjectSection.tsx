import { useCallback, useState } from "react";
import { ClipLoader } from "react-spinners";

import { useGetProjects } from "@/services/projects/projects-list";
import ProjectCard from "../common/ProjectCard";
import SearchInput from "../common/SearchInput";
import Pagination from "../common/Pagination";

const ProjectSection = () => {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { projects, isGettingProjects, meta } = useGetProjects({ q, page });

  // New searches reset to the first page.
  const handleSearch = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  return (
    <div className="p-2">
      <div className="my-4 flex justify-center md:justify-start">
        <SearchInput onSearch={handleSearch} placeholder="Search projects…" />
      </div>

      {isGettingProjects ? (
        <section className="my-10 flex items-center justify-center">
          <ClipLoader size={20} />
        </section>
      ) : !projects || projects.length === 0 ? (
        <section className="my-10 flex items-center justify-center">
          {q
            ? "No projects match your search."
            : "No project exists. Please start adding."}
        </section>
      ) : (
        <>
          <section className="my-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((projectItem) => (
              <ProjectCard key={projectItem?.id} {...projectItem} />
            ))}
          </section>

          <Pagination
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default ProjectSection;
