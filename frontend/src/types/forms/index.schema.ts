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
