import React from "react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

interface IBurgerBtnProps {
  isOpen?: boolean;
  className?: string;
  onClick?: () => void;
}

const BurgerBtn: React.FC<IBurgerBtnProps> = ({
  isOpen,
  className,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      animate={isOpen ? "open" : "close"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu-list"
      aria-label="Burger menu"
      className={twMerge(
        "flex w-5 cursor-pointer flex-col items-center gap-1",
        className
      )}
    >
      <motion.span
        variants={{
          open: {
            width: "1.25rem",
            rotate: "45deg",
            y: "0.38rem",
          },
        }}
        transition={{
          type: "spring",
          damping: 6,
        }}
        className="bg-secondary-text block h-0.5 w-4 rounded-full"
      />
      <motion.span
        variants={{
          open: {
            width: 0,
            opacity: 0,
          },
        }}
        className="bg-secondary-text block h-0.5 w-4 rounded-full opacity-50"
      />
      <motion.span
        variants={{
          open: {
            width: "1.25rem",
            rotate: "-45deg",
            y: "-0.35rem",
          },
        }}
        transition={{
          type: "spring",
          damping: 6,
        }}
        className="bg-secondary-text block h-0.5 w-4 rounded-full"
      />
    </motion.button>
  );
};

export default BurgerBtn;
