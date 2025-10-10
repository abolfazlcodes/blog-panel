import { Controller } from "react-hook-form";
import type {
  Control,
  RegisterOptions,
  FieldValues,
  Path,
} from "react-hook-form";
import { ToggleButton } from "./toggle-button";
import type { TToggleButtonProps } from "./toggle-button.types";

interface IToggleButtonControllerProps<T extends FieldValues>
  extends Omit<TToggleButtonProps, "value" | "onChange"> {
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  name: Path<T>;
}

const ToggleButtonController = <T extends FieldValues>({
  control,
  label,
  rules,
  name,
  ...props
}: IToggleButtonControllerProps<T>) => {
  return (
    <Controller
      name={name!}
      rules={rules}
      control={control}
      render={({ field }) => (
        <ToggleButton
          {...field}
          {...props}
          label={label}
          defaultValue={field.value}
          onChange={(value) => field.onChange(value)}
        />
      )}
    />
  );
};

export default ToggleButtonController;
