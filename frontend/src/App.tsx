import { Route, Routes } from "react-router";
import { lazy } from "react";
import PageLayout from "./components/common/PageLayout";
import SingleBlogPage from "./pages/SingleBlog";
import QueryProvider from "./providers/QueryClientProvider";
import { Toaster } from "react-hot-toast";

const LoginPage = lazy(() => import("./pages/Login"));
const HomePage = lazy(() => import("./pages/Home"));
const BlogPage = lazy(() => import("./pages/Blogs"));

function App() {
  return (
    <QueryProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/add-blog" element={<SingleBlogPage />} />
        </Route>
      </Routes>

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          className: "",
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </QueryProvider>
  );
}

export default App;
