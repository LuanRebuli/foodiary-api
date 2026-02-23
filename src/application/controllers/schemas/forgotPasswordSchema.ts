import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required"),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
