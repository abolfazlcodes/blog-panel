export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 255;

export const VALIDATION_MESSAGES = {
  email: {
    required: "Email is required",
    incorrect_format: "Email is invalid. Please provide a valid email address",
  },
  password: {
    required: "Password is required",
    minimum: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    maximum: `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
  },
};
