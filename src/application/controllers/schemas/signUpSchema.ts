import { Profile } from "@application/entities/Profile";
import z from "zod";

export const signUpSchema = z.object({
  account: z.object({
    email: z.string().min(1, "email is required"),
    password: z.string().min(8, "password must be at least 8 characters long"),
  }),
  profile: z.object({
    name: z.string().min(1, "name is required"),
    birthDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "birthDate must be a valid date (YYYY-MM-DD)",
      )
      .transform((date) => new Date(date))
      .refine(
        (date) => date >= new Date("1900-01-01"),
        "birthDate must be a valid date",
      ),
    gender: z.enum(Profile.Gender),
    height: z
      .number()
      .positive("height must be a positive number")
      .refine(
        (h) => h >= 0.5 && h <= 300,
        "height must be between 0.5 and 300 (meters or centimeters)",
      ),
    weight: z.number().positive("weight must be a positive number"),
    activityLevel: z.enum(Profile.ActivityLevel),
    goal: z.enum(Profile.Goal),
  }),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
