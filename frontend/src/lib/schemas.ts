import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  age: z.coerce.number()
    .min(13, "You must be at least 13 years old to join Rove.")
    .max(120, "Please enter a valid age."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

// 👇 Add this for Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});