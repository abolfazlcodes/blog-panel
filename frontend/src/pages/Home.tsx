import BlogsSection from "@/components/sections/BlogsSection";
import ProjectSection from "@/components/sections/ProjectSection";

const HomePage = () => {
  return (
    <main className="min-h-svh">
      <section>
        <header className="px-2 py-4 text-xl font-serif font-extrabold">
          <h2 className="text-d-h4 font-bold">Your Top Blogs</h2>
        </header>
        <BlogsSection />
      </section>

      <section>
        <header className="px-2 py-4 text-xl font-serif font-extrabold">
          <h2 className="text-d-h4 font-bold">Your Top Projects</h2>
        </header>
        <ProjectSection />
      </section>
    </main>
  );
};

export default HomePage;
