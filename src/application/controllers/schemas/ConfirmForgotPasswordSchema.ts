import z from "zod";

export const ConfirmForgotPasswordSchema = z.object({
  email: z.string().min(1, "email is required"),
  confirmationCode: z.string().min(1, "confirmationCode is required"),
  password: z.string().min(8, "password must be at least 8 characters long"),
});

export type ConfirmForgotPasswordBody = z.infer<
  typeof ConfirmForgotPasswordSchema
>;
