import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
  signupFormSchema,
  type TSignupForm,
} from "@/types/forms/auth.validations";
import TextFieldController from "../common/text-field/TextFieldController";
import { Button } from "../common/Button";
import PasswordHidden from "../common/text-field/PasswordHidden";
import { useSignupHandler } from "@/services/authentication/useSignup";

const AuthSignupForm = () => {
  const { handleSubmit, control } = useForm<TSignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });
  const [isPassHidden, setIsPassHidden] = useState<boolean>(true);

  const { isSigningUp, signupHandler } = useSignupHandler();

  const signupSubmitHandler = (values: TSignupForm) => {
    signupHandler(values);
  };

  return (
    <form
      onSubmit={handleSubmit(signupSubmitHandler)}
      id="signup-form"
      className="flex flex-col gap-y-4"
    >
      <div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-4">
        <div className="flex w-full flex-col gap-y-2">
          <TextFieldController
            control={control}
            name="first_name"
            placeholder="First name"
            dir="ltr"
            variant="outlined"
          />
        </div>
        <div className="flex w-full flex-col gap-y-2">
          <TextFieldController
            control={control}
            name="last_name"
            placeholder="Last name"
            dir="ltr"
            variant="outlined"
          />
        </div>
      </div>

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

      <div className="w-full mt-6">
        <Button
          colorType="success"
          className="w-full"
          type="submit"
          form="signup-form"
          disabled={isSigningUp}
          isLoading={isSigningUp}
        >
          Create account
        </Button>
      </div>
    </form>
  );
};

export default AuthSignupForm;
