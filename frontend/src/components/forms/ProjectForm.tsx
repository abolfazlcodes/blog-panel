import type {
  IProjectFormDefaultValues,
  IProjectFormProps,
} from "@/types/projects.types";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "../common/Button";
import { ClipLoader } from "react-spinners";
import TextFieldController from "../common/text-field/TextFieldController";
import { HelperText } from "../common/HelperText";
import ToggleButtonController from "../common/Toggle/toggle-button-controller";
import BlogTextEditor from "../common/BlogTextEditor";
import { useCreateProject } from "@/services/projects/create-project";
import { useUpdateProject } from "@/services/projects/update-project";
import toast from "react-hot-toast";
import { queryClient } from "@/providers/QueryClientProvider";
import { usePublishProject } from "@/services/projects/publish-project";

interface IProjectFormComponentProps {
  defaultValues?: IProjectFormDefaultValues;
}

const ProjectForm: React.FC<IProjectFormComponentProps> = ({
  defaultValues,
}) => {
  const navigate = useNavigate();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<IProjectFormProps>({
    defaultValues: {
      title: "",
      short_description: "",
      description: "",
      content: "",
      cover_image: "",
      is_featured: false,
    },
  });

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const publishProjectMutation = usePublishProject();

  const handleProjectSubmit = (values: IProjectFormProps) => {
    if (defaultValues) {
      updateProjectMutation.mutate(
        { data: values, id: defaultValues?.id },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({
              queryKey: ["projects"],
              exact: false,
            });
          },
          onError: (errors) => {
            const apiError = errors.cause as TApiErrorResponse;
            if (apiError.errors) {
              Object.entries(apiError.errors).forEach(([key, values]) => {
                setError(key as keyof IProjectFormProps, {
                  type: "custom",
                  message: values[0],
                });
              });
            }
          },
        }
      );
    } else {
      createProjectMutation.mutate(
        { data: values },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({
              queryKey: ["projects"],
              exact: false,
            });
            reset();
          },
          onError: (error) => {
            const apiError = error.cause as TApiErrorResponse;
            if (apiError.errors) {
              Object.entries(apiError.errors).forEach(([key, values]) => {
                setError(key as keyof IProjectFormProps, {
                  type: "custom",
                  message: values[0],
                });
              });
            }
          },
        }
      );
    }
  };

  const handlePublishBlog = () => {
    if (defaultValues) {
      publishProjectMutation.mutate(
        {
          id: defaultValues.id,
          shouldPublish: defaultValues?.is_draft ? false : true,
        },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({
              queryKey: ["projects"],
              exact: false,
            });
            reset();
          },
        }
      );
    } else {
      // publish and store blog if click directly on the publish before saving
    }
  };

  useEffect(() => {
    const saveDocHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        // call handleSubmit, it will validate and then call your handler
        handleSubmit(handleProjectSubmit)();
      }
    };
    const formProjectSection = window.document.getElementById(
      "add-project-section"
    );

    formProjectSection?.addEventListener("keydown", saveDocHandler);
    return () =>
      formProjectSection?.removeEventListener("keydown", saveDocHandler);
  }, [handleSubmit]);

  useEffect(() => {
    if (defaultValues) {
      console.log(defaultValues);

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const isLoading =
    createProjectMutation?.isPending || updateProjectMutation?.isPending;
  const isPublishing = publishProjectMutation?.isPending;

  return (
    <>
      <header className="flex items-center mb-3 gap-2 justify-end">
        <Button
          size="sm"
          type="submit"
          form="add-blog"
          variant="outlined"
          colorType="success"
        >
          {isLoading ? <ClipLoader size={10} /> : "Save"}
        </Button>

        {defaultValues && (
          <Button size="sm" colorType="success" onClick={handlePublishBlog}>
            {isPublishing ? (
              <ClipLoader size={10} />
            ) : defaultValues?.is_draft ? (
              "Publish"
            ) : (
              "Unpublish"
            )}
          </Button>
        )}
      </header>

      <section className="" id="add-project-section">
        <form
          id="add-blog"
          className="space-y-4"
          onSubmit={handleSubmit(handleProjectSubmit)}
        >
          <div className="flex flex-row gap-x-4 gap-y-2">
            <TextFieldController
              control={control}
              name="title"
              placeholder="Title"
              dir="ltr"
              variant="outlined"
            />

            <TextFieldController
              control={control}
              name="short_description"
              placeholder="Short Description"
              dir="ltr"
              variant="outlined"
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <textarea
                  className="w-full border px-3 py-1 border-disabled rounded-lg"
                  rows={5}
                  value={value}
                  onChange={onChange}
                />

                {errors?.description?.message && (
                  <HelperText
                    status="error"
                    text={errors?.description?.message}
                  />
                )}
              </>
            )}
          />

          <div className="border-divider bg-bg-main flex w-full items-center justify-between rounded-lg border py-2 ltr:pl-4 rtl:pr-4">
            <span className="text-secondary-text text-d-body2">Featured:</span>

            <ToggleButtonController
              size="small"
              control={control}
              name="is_featured"
              label={""}
            />
          </div>

          <Controller
            name="content"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <BlogTextEditor
                  content={value}
                  onChange={(editorContent) => {
                    onChange(editorContent);
                  }}
                />

                {errors?.content?.message && (
                  <HelperText status="error" text={errors?.content?.message} />
                )}
              </>
            )}
          />
        </form>
      </section>
    </>
  );
};

export default ProjectForm;
