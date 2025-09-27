import { createData } from "@/core/http-service";
import { useMutation } from "@tanstack/react-query";

interface ILoginCredentialsProps {
  email: string;
  password: string;
}

interface ILoginResponseProps {
  message: string;
  token: string;
  expiresAt: string;
}

const loginHandler = async (data: ILoginCredentialsProps) => {
  return await createData<ILoginResponseProps>(`/login`, data);
};

export const useLoginHandler = () => {
  return useMutation({
    mutationKey: ["login-user"],
    mutationFn: loginHandler,
  });
};
