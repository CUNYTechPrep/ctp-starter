// Validation for the sign-in input. Usernames are normalized (trimmed,
// lowercased) before they hit the unique index, so "Ada" and "ada" are the
// same account — normalization is a validation concern, not a UI concern.
import { z } from "zod";

export const Username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9][a-z0-9_-]{2,29}$/,
    "3–30 characters: a–z, 0–9, - or _, starting with a letter or number"
  );

export const SignIn = z.object({
  username: Username,
});

export type SignInInput = z.infer<typeof SignIn>;
