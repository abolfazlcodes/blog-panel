import { createData } from "@/core/http-service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface ISignupCredentialsProps {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const signupHandler = async (data: ISignupCredentialsProps) => {
  return await createData<{ message: string }>(`/sign-up`, data);
};

export const useSignupHandler = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ["signup-user"],
    mutationFn: signupHandler,
    onSuccess: (response) => {
      toast.success(response?.data?.message ?? "Account created. Please log in.");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast(error?.message);
    },
  });

  return {
    isSigningUp: mutation?.isPending,
    signupHandler: mutation?.mutate,
  };
};
