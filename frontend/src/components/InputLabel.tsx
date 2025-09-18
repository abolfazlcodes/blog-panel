import type { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IInputLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

const InputLabel: React.FC<IInputLabelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <label
      className={twMerge("text-gray-600 font-mono text-lg", className)}
      {...props}
    >
      {children}
    </label>
  );
};

export default InputLabel;
