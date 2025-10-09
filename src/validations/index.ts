import * as z from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(1, "Name is required"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().max(500, "Excerpt too long").optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title too long")
      .optional(),
    content: z.string().min(1, "Content is required").optional(),
    excerpt: z.string().max(500, "Excerpt too long").optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .transform(Number)
      .refine((n) => n > 0, "ID must be positive"),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
