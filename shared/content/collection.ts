import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "../../shared/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      cover: z
        .union([
          z.string().refine((value) => /^(\/|https?:)/.test(value)),
          image(),
        ])
        .optional(),
      coverAlt: z.string().optional(),
      featured: z.boolean().default(false),
      series: z.string().optional(),
      seriesOrder: z.number().optional(),
      bluesky: z.string().optional(),
    }),
});

export const collections = { blog };
