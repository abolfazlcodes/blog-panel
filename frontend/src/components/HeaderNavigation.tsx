// import { ArrowDown } from "lucide-react";
import { NavLink } from "react-router";

const HeaderNavigation = () => {
  return (
    <header className="flex px-4 max-w-[1280px] w-full mx-auto border items-center justify-between">
      <NavLink
        to={"/"}
        className={"block w-14 rounded-full overflow-hidden h-14 relative"}
      >
        <img
          src="/logo.png"
          className="w-full h-full absolute object-cover object-center"
        />
      </NavLink>

      <div className="flex items-center gap-x-4">
        <ul className="flex items-center gap-x-2 text-lg ">
          <NavLink
            to={"/add-blog"}
            className={
              "hover:text-green-600 transition-all duration-500 ease-in-out"
            }
          >
            <li>write</li>
          </NavLink>
          <NavLink
            to={"/blogs"}
            className={
              "hover:text-green-600 transition-all duration-500 ease-in-out"
            }
          >
            <li>recent posts</li>
          </NavLink>
        </ul>

        <div>
          {/* <div className="border border-green-600 rounded-full flex items-center justify-center gap-x-4 p-2 bg-green-200 font-semibold">
            <p>Abolfazl Jamshidi</p>
            <ArrowDown className="w-4 h-4" />
          </div> */}
          <NavLink to={"/login"}>
            <button className="bg-green-500 cursor-pointer w-24 px-3 py-1 rounded-sm text-white font-bold">
              Login
            </button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
