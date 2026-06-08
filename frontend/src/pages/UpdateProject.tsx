import Cookies from "js-cookie";

import { Button } from "@/components/common/Button";
import { useNavigate, useParams } from "react-router";
import { ClipLoader } from "react-spinners";
import { useGetSingleProject } from "@/services/projects/project-single";
import ProjectForm from "@/components/forms/ProjectForm";

const UpdateProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { projectData, isGettingProject } = useGetSingleProject(id);

  const handleLogin = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  if (isGettingProject) {
    return (
      <main className="min-h-svh flex items-center justify-center">
        <ClipLoader size={20} />
      </main>
    );
  }

  if (projectData) {
    return (
      <main className="min-h-svh">
        <ProjectForm
          defaultValues={{
            id: `${projectData?.id}`,
            content: projectData?.content as string,
            cover_image: projectData?.cover_image,
            description: projectData?.description,
            short_description: projectData?.short_description,
            title: projectData?.title,
            is_draft: projectData?.is_draft,
            is_featured: projectData?.is_featured,
            tags: projectData?.tags ?? [],
          }}
        />
      </main>
    );
  }

  if (!isGettingProject && !projectData) {
    return (
      <main className="min-h-svh">
        <p>Something went wrong. Please log in again</p>
        <Button onClick={handleLogin}>Login </Button>
      </main>
    );
  }
};

export default UpdateProject;
