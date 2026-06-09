import BlogsSection from "@/components/sections/BlogsSection";
import ProjectSection from "@/components/sections/ProjectSection";

const HomePage = () => {
  return (
    <main className="min-h-svh space-y-12">
      <section>
        <header className="px-2 py-4">
          <h2 className="text-d-h4 font-bold">Your Top Blogs</h2>
        </header>
        <BlogsSection />
      </section>

      <section>
        <header className="px-2 py-4">
          <h2 className="text-d-h4 font-bold">Your Top Projects</h2>
        </header>
        <ProjectSection />
      </section>
    </main>
  );
};

export default HomePage;
