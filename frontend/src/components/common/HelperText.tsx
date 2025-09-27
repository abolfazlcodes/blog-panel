import classNames from "classnames";

interface IHelperTextProps {
  status?: "active" | "error" | "success";
  isDisabled?: boolean;
  text: string;
  customClassName?: string;
}

export const HelperText: React.FC<IHelperTextProps> = ({
  status = "active",
  isDisabled = false,
  text,
  customClassName,
}) => {
  const textClass = classNames(
    "helper-text",
    {
      "text-secondary-text": status === "active" && !isDisabled,
      "text-error": status === "error" && !isDisabled,
      "text-success": status === "success" && !isDisabled,
      "text-disabled": isDisabled,
    },
    customClassName
  );

  return (
    <div className={textClass}>
      <span>{text}</span>
    </div>
  );
};
