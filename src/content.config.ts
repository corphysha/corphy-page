import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  schema: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().url("Must be a valid URL").optional(),
    github: z.string().url("Must be a valid GitHub URL").optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  projects,
};
