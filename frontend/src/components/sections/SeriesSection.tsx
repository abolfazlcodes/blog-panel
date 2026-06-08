import { useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

import { Button } from "../common/Button";
import { queryClient } from "@/providers/QueryClientProvider";
import { useGetSeries } from "@/services/series/series-list";
import { useCreateSeries } from "@/services/series/create-series";
import { useUpdateSeries } from "@/services/series/update-series";
import { useDeleteSeries } from "@/services/series/delete-series";
import type { ISeriesListItem } from "@/types/series.types";

const SeriesSection = () => {
  const { series, isGettingSeries } = useGetSeries();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  // null = creating a new series; a number = editing that series id
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["series"] });

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  const startEdit = (item: ISeriesListItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Series title is required.");
      return;
    }

    const data = { title: title.trim(), description: description.trim() };
    const onError = (error: Error) => {
      const apiError = error.cause as TApiErrorResponse | undefined;
      toast.error(apiError?.message || error.message || "Something went wrong.");
    };

    if (editingId !== null) {
      updateSeries.mutate(
        { id: editingId, data },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            resetForm();
            refresh();
          },
          onError,
        }
      );
    } else {
      createSeries.mutate(
        { data },
        {
          onSuccess: (response) => {
            toast.success(response?.data?.message);
            resetForm();
            refresh();
          },
          onError,
        }
      );
    }
  };

  const handleDelete = (item: ISeriesListItem) => {
    deleteSeries.mutate(
      { id: item.id },
      {
        onSuccess: (response) => {
          toast.success(response?.data?.message);
          if (editingId === item.id) resetForm();
          refresh();
        },
        onError: (error) => toast.error(error?.message),
      }
    );
  };

  const isSaving = createSeries.isPending || updateSeries.isPending;

  return (
    <main className="mx-auto w-full max-w-[900px] space-y-8 p-4">
      <div>
        <h4 className="font-semibold">Blog Series</h4>
        <p className="text-secondary-text text-d-body2">
          Group related posts into an ordered series. Assign a blog to a series
          and set its part number from the blog editor.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-divider bg-bg-main space-y-3 rounded-lg border p-4"
      >
        <h6 className="font-medium">
          {editingId !== null ? "Edit series" : "Create a new series"}
        </h6>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Series title"
          className="border-disabled w-full rounded-lg border px-3 py-2 outline-none"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short description (optional)"
          rows={3}
          className="border-disabled w-full rounded-lg border px-3 py-2 outline-none"
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" colorType="success">
            {isSaving ? (
              <ClipLoader size={10} />
            ) : editingId !== null ? (
              "Update series"
            ) : (
              "Create series"
            )}
          </Button>

          {editingId !== null && (
            <Button
              type="button"
              size="sm"
              variant="outlined"
              onClick={resetForm}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {isGettingSeries ? (
        <div className="flex justify-center py-6">
          <ClipLoader size={20} />
        </div>
      ) : !series || series.length === 0 ? (
        <p className="text-secondary-text py-6 text-center">
          No series yet. Create one above.
        </p>
      ) : (
        <ul className="space-y-3">
          {series.map((item) => (
            <li
              key={item.id}
              className="border-divider flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-secondary-text text-d-body2">
                    {item.description}
                  </p>
                )}
                <p className="text-secondary-text text-xs">
                  {item.blogs_count} blog{item.blogs_count === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outlined"
                  colorType="success"
                  onClick={() => startEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outlined"
                  colorType="error"
                  onClick={() => handleDelete(item)}
                >
                  {deleteSeries.isPending ? <ClipLoader size={10} /> : "Delete"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default SeriesSection;
