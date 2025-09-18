import { Route, Routes } from "react-router";
import { lazy } from "react";
import PageLayout from "./components/PageLayout";
import SingleBlogPage from "./pages/SingleBlog";

const LoginPage = lazy(() => import("./pages/Login"));
const HomePage = lazy(() => import("./pages/Home"));
const BlogPage = lazy(() => import("./pages/Blogs"));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/add-blog" element={<SingleBlogPage />} />
      </Route>
    </Routes>
  );
}

export default App;
