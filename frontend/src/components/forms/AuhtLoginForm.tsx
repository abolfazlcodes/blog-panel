import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginFormSchema,
  type TLoginForm,
} from "@/types/forms/auth.validations";
import TextFieldController from "../common/text-field/TextFieldController";
import { Button } from "../common/Button";
import { useLoginHandler } from "@/services/authentication/useLogin";
import { useState } from "react";
import PasswordHidden from "../common/text-field/PasswordHidden";

const AuthLoginForm = () => {
  const { handleSubmit, control } = useForm<TLoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isPassHidden, setIsPassHidden] = useState<boolean>(true);

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
          type={isPassHidden ? "password" : "text"}
          placeholder="password"
          dir="ltr"
          variant="outlined"
          endAdornment={
            <PasswordHidden
              isHidden={isPassHidden}
              onToggle={() => setIsPassHidden(!isPassHidden)}
            />
          }
        />
      </div>

      <div className="w-full mt-10">
        <Button
          colorType="success"
          size="lg"
          className="w-full text-base font-semibold shadow-lg shadow-success/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-success/50"
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
