import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import CoverUploader from "./CoverUploader";

interface CoverUploaderControllerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  maxFileSize?: number;
  allowedFormats?: string[];
  disabled?: boolean;
}

const CoverUploaderController = <T extends FieldValues>({
  control,
  name,
  maxFileSize,
  allowedFormats,
  disabled,
}: CoverUploaderControllerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <CoverUploader
          value={value}
          onUploadComplete={(file) => {
            // if user removed image
            if (!file || !file.url) {
              onChange("");
            } else {
              onChange(file.url);
            }
          }}
          maxFileSize={maxFileSize}
          allowedFormats={allowedFormats}
          disabled={disabled}
        />
      )}
    />
  );
};

export default CoverUploaderController;
