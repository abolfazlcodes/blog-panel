import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginFormSchema,
  type TLoginForm,
} from "@/types/forms/auth.validations";
import TextFieldController from "../common/text-field/TextFieldController";
import { Button } from "../common/Button";
import { useLoginHandler } from "@/services/authentication/useLogin";

const AuthLoginForm = () => {
  const { handleSubmit, control } = useForm<TLoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isLoggingIn, loginHandler } = useLoginHandler();

  const loginSubmitHandler = (values: TLoginForm) => {
    loginHandler(values);
  };

  return (
    <form
      onSubmit={handleSubmit(loginSubmitHandler)}
      id="login-form"
      className="flex flex-col gap-y-4"
    >
      <div className="flex flex-col gap-y-2">
        <TextFieldController
          control={control}
          name="email"
          type="email"
          placeholder="Email"
          dir="ltr"
          variant="outlined"
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <TextFieldController
          control={control}
          name="password"
          type="password"
          placeholder="password"
          dir="ltr"
          variant="outlined"
        />
      </div>

      <div className="w-full mt-10">
        <Button
          colorType="success"
          className="w-full"
          type="submit"
          form="login-form"
          disabled={isLoggingIn}
          isLoading={isLoggingIn}
        >
          Login
        </Button>
      </div>
    </form>
  );
};

export default AuthLoginForm;
