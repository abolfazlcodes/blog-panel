import { z } from "zod";
import { EMAIL_FIELD, PASSWORD_FIELD } from "./index.schema";

export const loginFormSchema = z.object({
  email: EMAIL_FIELD,
  password: PASSWORD_FIELD,
});

export type TLoginForm = z.infer<typeof loginFormSchema>;
