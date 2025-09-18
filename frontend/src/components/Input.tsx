import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

const Input: React.FC<IInputProps> = ({
  wrapperClassName,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "w-full rounded-lg overflow-hidden border border-gray-300 transition-all duration-200 ease-in focus-within:border-gray-400",
        wrapperClassName
      )}
    >
      <input
        {...props}
        className={twMerge("w-full focus:outline-0 px-2 py-3", className)}
      />
    </div>
  );
};

export default Input;
