export type TToggleButtonProps = {
  label: string;
  defaultValue?: boolean;
  onChange?: (newValue: boolean) => void;
  size?: "medium" | "small";
  disabled?: boolean;
  activeText?: string;
  inactiveText?: string;
  dynamicTextClassName?: string;
};
