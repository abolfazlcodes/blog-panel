import { Outlet } from "react-router";
import HeaderNavigation from "./HeaderNavigation";

const PageLayout = () => {
  return (
    <main className="w-full min-h-svh">
      <HeaderNavigation />

      <main className="max-w-[1280px] p-4 w-full mx-auto py-10">
        <Outlet />
      </main>
    </main>
  );
};

export default PageLayout;
