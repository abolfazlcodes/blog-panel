import { Outlet } from "react-router";
import HeaderNavigation from "./HeaderNavigation";

const PageLayout = () => {
  return (
    <main className="w-full min-h-svh">
      <HeaderNavigation />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <Outlet />
      </main>
    </main>
  );
};

export default PageLayout;
