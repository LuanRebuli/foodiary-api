import z from "zod";

export const helloSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export type HelloBody = z.infer<typeof helloSchema>;
