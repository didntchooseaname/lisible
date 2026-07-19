import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

export type CoverInput = ImageMetadata | string;

export async function coverSrc(
  cover: CoverInput | undefined,
  width = 800,
): Promise<string | undefined> {
  if (!cover) return undefined;
  if (typeof cover === "string") return cover;
  const image = await getImage({ src: cover, width, format: "webp" });
  return image.src;
}
