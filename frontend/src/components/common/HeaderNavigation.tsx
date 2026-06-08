// import { ArrowDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Button } from "./Button";
import { useGetProfile } from "@/services/user-profile";
import { logout } from "@/core/http-service";
import { useState } from "react";
import BurgerBtn from "./BurgerBtn";
import MobileSidebar from "./MobileSidebar";
import { SIDEBAR_LINKS } from "@/constants";
import { customTwMerge } from "@/utils/custom-tailwind-merge";

const HeaderNavigation = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

  const { userInfo } = useGetProfile();

  const handleLogOutUser = async () => {
    await logout();
    navigate("/login");
  };

  const openMobileSidebarHandler = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebarHandler = () => setIsMobileSidebarOpen(false);

  return (
    <header className="flex px-4 py-2 max-w-[1280px] w-full mx-auto shadow-bg-field items-center justify-between">
      <div className="flex items-center gap-2">
        <NavLink
          to={"/"}
          className={"block w-10 rounded-full overflow-hidden h-10 relative"}
        >
          <img
            src="/notiq-logo.png"
            className="w-full h-full absolute object-cover object-center"
          />
        </NavLink>

        <p className="">Welcome, {userInfo?.name?.split(" ")[0]}</p>
      </div>

      <div className="flex items-center gap-x-4">
        <ul className="items-center gap-x-3 hidden lg:flex">
          {SIDEBAR_LINKS?.slice(1)?.map((item) => (
            <NavLink
              key={item?.id}
              to={item?.href}
              className={({ isActive }) =>
                customTwMerge(
                  "hover:text-success font-medium text-d-subtitle2 transition-all duration-500 ease-in-out",
                  isActive && "text-success hover:text-success font-semibold"
                )
              }
            >
              {item?.title}
            </NavLink>
          ))}
        </ul>

        <div className="hidden lg:block">
          {userInfo ? (
            <Button
              onClick={handleLogOutUser}
              variant="contained"
              colorType="error"
              size="sm"
              className="rounded-full flex items-center justify-center gap-x-4 p-2 cursor-pointer font-semibold"
            >
              Log out
            </Button>
          ) : (
            <NavLink to={"/login"}>
              <Button
                colorType="success"
                className="bg-green-500 cursor-pointer w-24 px-3 py-1 rounded-sm text-white font-bold"
              >
                Login
              </Button>
            </NavLink>
          )}
        </div>

        <div className="lg:hidden block">
          <BurgerBtn
            isOpen={isMobileSidebarOpen}
            onClick={
              isMobileSidebarOpen
                ? closeMobileSidebarHandler
                : openMobileSidebarHandler
            }
          />
        </div>

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebarHandler}
        />
      </div>
    </header>
  );
};

export default HeaderNavigation;
