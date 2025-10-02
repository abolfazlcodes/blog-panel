// import { ArrowDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Button } from "./Button";
import { useGetProfile } from "@/services/user-profile";
import Cookies from "js-cookie";

const HeaderNavigation = () => {
  const navigate = useNavigate();

  const { userInfo } = useGetProfile();

  const handleLogOutUser = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  return (
    <header className="flex px-4 py-2 max-w-[1280px] w-full mx-auto shadow-bg-field items-center justify-between">
      <div className="flex items-center gap-2">
        <NavLink
          to={"/"}
          className={"block w-14 rounded-full overflow-hidden h-14 relative"}
        >
          <img
            src="/logo.png"
            className="w-full h-full absolute object-cover object-center"
          />
        </NavLink>

        <p className="pt-3">Welcome back, {userInfo?.name}</p>
      </div>

      <div className="flex items-center gap-x-4">
        <ul className="flex items-center gap-x-2 text-lg ">
          <NavLink
            to={"/add-blog"}
            className={
              "hover:text-green-600 transition-all duration-500 ease-in-out"
            }
          >
            <Button colorType="success" variant="soft">
              <li>write</li>
            </Button>
          </NavLink>
          {/* <NavLink
            to={"/blogs"}
            className={
              "hover:text-green-600 transition-all duration-500 ease-in-out"
            }
          >
            <Button colorType="success" variant="soft">
              <li>recent posts</li>
            </Button>
          </NavLink> */}
        </ul>

        <div>
          {userInfo ? (
            <div
              role="button"
              onClick={handleLogOutUser}
              className="rounded-full flex items-center justify-center gap-x-4 p-2 text-error cursor-pointer bg-error-lighter font-semibold"
            >
              Log out
            </div>
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
      </div>
    </header>
  );
};

export default HeaderNavigation;
