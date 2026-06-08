import { z } from "zod";
import {
  EMAIL_FIELD,
  NAME_FIELD,
  PASSWORD_FIELD,
  STRONG_PASSWORD_FIELD,
} from "./index.schema";

export const loginFormSchema = z.object({
  email: EMAIL_FIELD,
  password: PASSWORD_FIELD,
});

export type TLoginForm = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z.object({
  first_name: NAME_FIELD,
  last_name: NAME_FIELD,
  email: EMAIL_FIELD,
  password: STRONG_PASSWORD_FIELD,
});

export type TSignupForm = z.infer<typeof signupFormSchema>;
