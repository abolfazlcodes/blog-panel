import AuthLoginForm from "@/components/forms/AuhtLoginForm";

const LoginPage = () => {
  return (
    <main className="w-full h-svh md:flex-row flex-col flex items-center justify-center bg-white">
      <div className="bg-success-darker w-full px-12 flex flex-col items-center justify-center h-1/3 md:order-1 md:h-full">
        <div className="flex flex-col gap-y-3 md:gap-y-6 max-w-[500px]">
          <h1 className="text-white text-m-h4 md:text-d-h4">
            Revolutionize Your Website Management With Easy Self-host Panel
          </h1>
          <p className="text-[#cbfcff] text-m-body2 md:text-d-body2">
            "No need to static content managers and .mdx files anymore. Easy
            management of content for your website with ease of use."
          </p>
          <p className="text-[#cdfcff] w-full text-m-body2 md:text-d-body2">
            By Abolfazl Jamshidi
          </p>
        </div>
      </div>

      <div className="h-full w-full px-12 py-10">
        <div className="max-w-[540px] h-full flex flex-col gap-y-8 md:justify-center ">
          <div className="flex items-center gap-x-2">
            <figure className="relative w-14 h-14">
              <img
                src="/notiq-logo.png"
                className="absolute rounded-2xl w-full h-full object-cover"
              />
            </figure>
            <h6 className="text-d-h4 font-semibold font-mono capitalize">
              Notiq
            </h6>
          </div>

          <h4>Welcome Back!</h4>
          <p>
            Sign in to have access to your content creation dashboard and
            innovate the world
          </p>

          <AuthLoginForm />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
