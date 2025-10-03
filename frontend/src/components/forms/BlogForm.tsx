import { queryClient } from "@/providers/QueryClientProvider";
import { useCreateBlog } from "@/services/blog/create-blog";
import type {
  IBlogFormDefaultValues,
  IBlogFormProps,
} from "@/types/blogs.types";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Button } from "../common/Button";
import TextFieldController from "../common/text-field/TextFieldController";
import BlogTextEditor from "../common/BlogTextEditor";
import { useUpdateBlog } from "@/services/blog/update-blog";
import { usePublishBlog } from "@/services/blog/publish-blog";
import { ClipLoader } from "react-spinners";
import { HelperText } from "../common/HelperText";

interface IBlogFormComponentProps {
  defaultValues?: IBlogFormDefaultValues;
}

const BlogForm: React.FC<IBlogFormComponentProps> = ({ defaultValues }) => {
  const navigate = useNavigate();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<IBlogFormProps>({
    defaultValues: {
      title: "",
      short_description: "",
      description: "",
      content: "",
      cover_image: "",
    },
  });

  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const publishBlogMutation = usePublishBlog();

  const handleBlogSubmit = (values: IBlogFormProps) => {
    if (defaultValues) {
      updateBlogMutation.mutate(
        { data: values, id: defaultValues?.id },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({ queryKey: ["blogs"], exact: false });
          },
          onError: (errors) => {
            console.log(errors);
          },
        }
      );
    } else {
      createBlogMutation.mutate(
        { data: values },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({ queryKey: ["blogs"], exact: false });
            reset();
          },
          onError: (error) => {
            console.log(error);
            const apiError = error.cause as TApiErrorResponse;
            if (apiError.errors) {
              Object.entries(apiError.errors).forEach(([key, values]) => {
                setError(key as keyof IBlogFormProps, {
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
      publishBlogMutation.mutate(
        {
          id: defaultValues.id,
          shouldPublish: defaultValues?.is_draft ? false : true,
        },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            navigate("/");
            queryClient.refetchQueries({ queryKey: ["blogs"], exact: false });
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
        handleSubmit(handleBlogSubmit)();
      }
    };
    const formBlogSection = window.document.getElementById("add-blog-section");

    formBlogSection?.addEventListener("keydown", saveDocHandler);
    return () =>
      formBlogSection?.removeEventListener("keydown", saveDocHandler);
  }, [handleSubmit]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const isLoading =
    createBlogMutation?.isPending || updateBlogMutation?.isPending;
  const isPublishing = publishBlogMutation?.isPending;

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
        <Button size="sm" colorType="success" onClick={handlePublishBlog}>
          {isPublishing ? (
            <ClipLoader size={10} />
          ) : defaultValues?.is_draft ? (
            "Publish"
          ) : (
            "Unpublish"
          )}
        </Button>
      </header>

      <section className="" id="add-blog-section">
        <form
          id="add-blog"
          className="space-y-4"
          onSubmit={handleSubmit(handleBlogSubmit)}
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

export default BlogForm;
