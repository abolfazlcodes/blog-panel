import AuthLoginForm from "@/components/forms/AuhtLoginForm";

const LoginPage = () => {
  return (
    <main className="w-full  h-svh flex items-center justify-center p-4 py-10 bg-green-100">
      <article className="w-full bg-white max-w-[540px] shadow-xl rounded-3xl p-2 gap-y-10 flex flex-col pb-10 pt-10">
        <header className="flex flex-col items-center justify-center gap-y-2">
          <figure className="relative w-20 h-20">
            <img
              src="/logo.png"
              className="absolute w-full h-full object-cover"
            />
          </figure>

          <h1 className="text-lg font-semibold font-mono capitalize">
            Enjoy writing your thoughts
          </h1>
        </header>

        <AuthLoginForm />
      </article>
    </main>
  );
};

export default LoginPage;
