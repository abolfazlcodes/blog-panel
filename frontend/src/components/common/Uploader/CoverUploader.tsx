/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useRef } from "react";
import classNames from "classnames";
import { useUploader } from "@/hooks/useUploader";

interface CoverUploaderProps {
  value?: TMediaFile | string;
  onUploadComplete?: (file: TMediaFile) => void;
  maxFileSize?: number;
  allowedFormats?: string[];
  disabled?: boolean;
}

const CoverUploader: React.FC<CoverUploaderProps> = ({
  value,
  onUploadComplete,
  maxFileSize,
  allowedFormats,
  disabled = false,
}) => {
  const { state, uploadFile, resetUploader } = useUploader({
    maxFileSize,
    allowedFormats,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const uploadedUrl = await uploadFile(file);
    if (uploadedUrl && onUploadComplete) {
      onUploadComplete({ url: uploadedUrl } as TMediaFile);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleRemove = () => {
    resetUploader();
    onUploadComplete?.(null as unknown as TMediaFile);
  };

  return (
    <div
      onClick={handleClick}
      className={classNames(
        "relative w-full h-80 flex items-center justify-center rounded-lg border border-dashed cursor-pointer overflow-hidden",
        {
          "border-gray-300 bg-gray-50": state.status === "idle",
          "border-blue-500 bg-blue-50": state.status === "uploading",
          "border-green-500 bg-green-50": state.status === "success",
          "border-red-500 bg-red-50": state.status === "error",
          "cursor-not-allowed opacity-50": disabled,
        }
      )}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={allowedFormats?.join(",")}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {state?.previewUrl || value ? (
        <img
          // @ts-ignore
          src={(state?.previewUrl as string) || value}
          alt="cover preview"
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <span className="text-gray-400">
          {state.status === "error"
            ? state.error
            : "Click to upload cover image"}
        </span>
      )}

      {(state.status === "success" || state.status === "uploading") && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1"
        >
          ✕
        </button>
      )}

      {state.status === "uploading" && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CoverUploader;
