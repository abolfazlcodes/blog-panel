import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import BurgerBtn from "./BurgerBtn";
import ExitBtn from "./ExitBtn";
import { SIDEBAR_LINKS } from "@/constants";
import { NavLink } from "react-router";
import { customTwMerge } from "@/utils/custom-tailwind-merge";

interface IMobileSidebarProps {
  isOpen: boolean;
  className?: string;
  onClose: () => void;
}

const MobileSidebar: React.FC<IMobileSidebarProps> = ({ isOpen, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <AnimatePresence>
      <motion.aside
        animate={isOpen ? "open" : "close"}
        variants={{
          open: {
            x: "-240px",
          },
          close: {
            x: "320px",
          },
        }}
        transition={{
          duration: 0.4,
        }}
        ref={ref}
        className={`bg-gray-200 border-l-divider fixed top-0 z-[101] flex h-dvh w-full max-w-[280px] flex-col border-l border-dashed px-4 pt-3 pb-10 transition-all duration-500 ease-linear 2xl:relative 2xl:row-span-2 lg:hidden`}
      >
        <div className="flex w-full items-center justify-center px-4 pt-3 pb-1">
          <BurgerBtn isOpen={isOpen} onClick={onClose} className="mr-auto" />

          <NavLink
            to={"/"}
            onClick={onClose}
            className={"block w-10 rounded-full overflow-hidden h-10 relative"}
          >
            <img
              src="/notiq-logo.png"
              className="w-full h-full absolute object-cover object-center"
            />
          </NavLink>
        </div>

        <div className="flex h-full flex-col justify-between gap-y-14 2xl:gap-y-[88px]">
          <ul className="mt-7 flex flex-col gap-y-2 2xl:mt-11">
            {SIDEBAR_LINKS.map((linkItem, idx) => {
              return (
                <motion.div
                  key={linkItem.id}
                  animate={isOpen ? "open" : "close"}
                  initial="close"
                  exit="close"
                  transition={{
                    duration: 0.5,
                    delay: (idx + 1) * 0.2,
                  }}
                  variants={{
                    open: {
                      x: 0,
                    },
                    close: {
                      x: "320px",
                    },
                  }}
                  className="h-[50px]"
                >
                  <NavLink
                    to={linkItem?.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      customTwMerge(
                        "hover:bg-success-light hover:text-white hover:font-medium w-full h-full flex items-center px-4 rounded-lg transition-all duration-300 ease-in",
                        isActive && "bg-success-light text-white font-medium"
                      )
                    }
                  >
                    {linkItem?.title}
                  </NavLink>
                </motion.div>
              );
            })}
          </ul>

          <div className="space-y-[2.375rem]">
            {/* <ProfileBtn />
             */}
            <ExitBtn />
            <p
              dir="ltr"
              className="text-m-body2 text-secondary-text !text-center"
            >
              © Copyright 2025 - All rights reserved by Abolfazl Jamshidi
            </p>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default MobileSidebar;
