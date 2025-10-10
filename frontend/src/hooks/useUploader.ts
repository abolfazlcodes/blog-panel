/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleImageUpload } from "@/lib/tiptap-utils";
import { useState, useCallback } from "react";

interface UseUploaderProps {
  maxFileSize?: number;
  allowedFormats?: string[];
}

export interface UploadFileState {
  file?: File;
  previewUrl?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
  uploadedFile?: TMediaFile;
}

export const useUploader = ({
  maxFileSize,
  allowedFormats,
}: UseUploaderProps) => {
  const [state, setState] = useState<UploadFileState>({
    progress: 0,
    status: "idle",
  });

  const uploadFile = useCallback(
    async (file: File) => {
      // reset state
      setState({ file, progress: 0, status: "uploading" });

      // Validate file type
      if (allowedFormats && !allowedFormats.includes(file.type)) {
        return setState({
          file,
          progress: 0,
          status: "error",
          error: "File format not supported",
        });
      }

      // Validate file size
      if (maxFileSize && file.size > maxFileSize) {
        return setState({
          file,
          progress: 0,
          status: "error",
          error: `File size exceeds ${maxFileSize / 1024 / 1024} MB`,
        });
      }

      try {
        const uploadedUrl = await handleImageUpload(file, (event) => {
          setState((prev) => ({ ...prev, progress: event.progress }));
        });

        setState({
          file,
          previewUrl: uploadedUrl,
          progress: 100,
          status: "success",
          uploadedFile: { url: uploadedUrl } as TMediaFile,
        });

        return uploadedUrl;
      } catch (err: any) {
        setState({
          file,
          progress: 0,
          status: "error",
          error: err?.message || "Upload failed",
        });
        return null;
      }
    },
    [allowedFormats, maxFileSize]
  );

  const resetUploader = () => {
    setState({ progress: 0, status: "idle", previewUrl: "" });
  };

  return { state, uploadFile, resetUploader };
};
