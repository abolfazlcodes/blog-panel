import Cookies from "js-cookie";
import { createData } from "@/core/http-service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ["login-user"],
    mutationFn: loginHandler,

    onSuccess: (response) => {
      if (response?.data?.token) {
        toast.success(response?.data?.message);
        Cookies.set("auth_token", response?.data?.token, {
          expires: new Date(response?.data?.expiresAt),
        });

        // redirect the user
        navigate("/", {
          replace: true,
        });
      }
    },
    onError: (error) => {
      toast(error?.message);
      // const apiError = error.cause as TApiErrorResponse;
      // if (apiError.errors) {
      //   Object.entries(apiError.errors).forEach(([key, values]) => {
      //     setError(key as keyof TLoginForm, {
      //       type: "custom",
      //       message: values[0],
      //     });
      //   });
      // }
    },
  });

  return {
    isLoggingIn: mutation?.isPending,
    loginHandler: mutation?.mutate,
  };
};
