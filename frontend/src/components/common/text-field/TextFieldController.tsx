import {
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
  Controller,
  get,
} from "react-hook-form";

import type { TextFieldProps } from "./TextField.types";
import TextField from "./TextField";

interface ITextFieldControllerProps<T extends FieldValues>
  extends Omit<TextFieldProps, "value" | "onChange"> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

const TextFieldController = <T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: ITextFieldControllerProps<T>) => {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, formState: { errors } }) => (
        <TextField
          {...field}
          {...props}
          error={Boolean(get(errors, name))}
          helperText={
            (get(errors, name)?.message as string) ?? props.helperText
          }
          value={field.value}
          onChange={(value) => field.onChange(value)}
        />
      )}
    />
  );
};

export default TextFieldController;
