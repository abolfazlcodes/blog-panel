import { useGetProjects } from "@/services/projects/projects-list";
import { ClipLoader } from "react-spinners";
import ProjectCard from "../common/ProjectCard";

const ProjectSection = () => {
  const { isGettingProjects, projects } = useGetProjects();

  if (isGettingProjects) {
    <section className="flex items-center justify-center p-2 my-10">
      <ClipLoader size={6} />
    </section>;
  }

  if (!projects || projects?.length === 0) {
    return (
      <section className="flex items-center justify-center p-2 my-10">
        no blog exists. please start writing
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 my-5">
      {projects?.map((projectItem) => (
        <ProjectCard key={projectItem?.id} {...projectItem} />
      ))}
    </section>
  );
};

export default ProjectSection;
