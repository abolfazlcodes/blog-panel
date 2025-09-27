import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button: React.FC<IButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={twMerge(
        "bg-green-400 cursor-pointer w-full py-2 rounded-lg text-white font-bold font-mono",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
