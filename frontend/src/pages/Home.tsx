import BlogCard from "@/components/BlogCard";

const HomePage = () => {
  return (
    <main className="min-h-svh">
      <header className="px-2 py-4 text-xl font-serif font-extrabold">
        <h1>Here are your top stories</h1>
      </header>

      <section className="flex flex-wrap gap-6 p-2 my-10">
        <BlogCard />
        <BlogCard />
        <BlogCard />
      </section>
    </main>
  );
};

export default HomePage;
