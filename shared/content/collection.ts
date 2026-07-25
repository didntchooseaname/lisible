import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

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

// Portfolio data consumed by the certifications and friends pages. The image
// and avatar fields hold either a demo asset key (resolved by each variant
// page) or a URL starting with "/" or "http".
const certifications = defineCollection({
  loader: file("../../shared/content/portfolio/certifications.json"),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    year: z.string(),
    image: z.string(),
    description: z.object({ fr: z.string(), en: z.string() }),
    post: z.string().optional(),
  }),
});

const friends = defineCollection({
  loader: file("../../shared/content/portfolio/friends.json"),
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
    bio: z.object({ fr: z.string(), en: z.string() }),
    url: z.string().optional(),
  }),
});

export const collections = { blog, certifications, friends };
