import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";
import { EMAIL_REGEX_PATTERN } from "@/utils/validations";
import z from "zod";

export const EMAIL_FIELD = z
  .string({
    message: VALIDATION_MESSAGES.email.required,
  })
  .nonempty(VALIDATION_MESSAGES.email.required)
  .regex(EMAIL_REGEX_PATTERN, {
    message: VALIDATION_MESSAGES.email.incorrect_format,
  });

export const PASSWORD_FIELD = z
  .string({
    message: VALIDATION_MESSAGES.password.required,
  })
  .min(MIN_PASSWORD_LENGTH, {
    message: VALIDATION_MESSAGES.password.minimum,
  })
  .max(MAX_PASSWORD_LENGTH, {
    message: VALIDATION_MESSAGES.password.maximum,
  })
  .nonempty(VALIDATION_MESSAGES.password.required);

// Signup password: mirrors the backend's strength rules.
export const STRONG_PASSWORD_FIELD = PASSWORD_FIELD.regex(/[A-Z]/, {
  message: "Password must contain at least one capital letter",
})
  .regex(/\d/, { message: "Password must contain at least one number" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character",
  });

export const NAME_FIELD = z
  .string({ message: "This field is required" })
  .trim()
  .min(3, { message: "Must be at least 3 characters" });
