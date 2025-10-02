import BlogsSection from "@/components/sections/BlogsSection";

const HomePage = () => {
  return (
    <main className="min-h-svh">
      <header className="px-2 py-4 text-xl font-serif font-extrabold">
        <h1>Here are your top stories</h1>
      </header>

      <BlogsSection />
    </main>
  );
};

export default HomePage;
