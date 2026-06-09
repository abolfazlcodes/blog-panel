import { Plus } from "lucide-react";
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
    <header className="shadow-bg-field w-full">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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

          <p className="font-medium whitespace-nowrap">
            Welcome, {userInfo?.name?.split(" ")[0]}
          </p>
        </div>

        <div className="flex items-center gap-x-4">
        <ul className="hidden items-center gap-x-2 lg:flex">
          {SIDEBAR_LINKS?.slice(1)?.map((item) => {
            const isCreate = item?.href?.startsWith("/add-");
            return (
              <li key={item?.id}>
                <NavLink
                  to={item?.href}
                  className={({ isActive }) =>
                    isCreate
                      ? "bg-success hover:bg-success-dark hover:shadow-success text-d-subtitle2 flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-white transition-all duration-300"
                      : customTwMerge(
                          "text-secondary-text hover:bg-success/8 hover:text-success text-d-subtitle2 rounded-full px-3 py-2 font-medium transition-all duration-300",
                          isActive && "bg-success/10 text-success font-semibold"
                        )
                  }
                >
                  {isCreate && <Plus size={16} />}
                  {item?.title}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          {userInfo ? (
            <Button
              onClick={handleLogOutUser}
              variant="contained"
              colorType="error"
              size="sm"
              className="cursor-pointer rounded-full px-4 font-semibold"
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
      </div>
    </header>
  );
};

export default HeaderNavigation;
