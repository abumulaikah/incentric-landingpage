import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Incentric'),
    authorAvatar: z.string().optional(),
    heroImage: z.string().url().optional(),
    heroImageAlt: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
