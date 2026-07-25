import { readFileSync } from "node:fs";
import path from "node:path";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** shared/ has no node_modules, so it stays free of runtime dependencies. */
function walk(node: HastNode, visitor: (node: HastNode) => void): void {
  visitor(node);
  for (const child of node.children ?? []) walk(child, visitor);
}

/**
 * Stamps intrinsic width and height on markdown images that point at a file in
 * public/, and marks them lazy and async by default.
 *
 * Authors write plain markdown, so they cannot supply dimensions themselves; an
 * image without them reserves no space and shifts the layout once it loads.
 * Reading the intrinsic size at build time keeps the zero-CLS promise without
 * asking anything of the author.
 */
function svgSize(source: string): [number, number] | null {
  const width = source.match(/\bwidth="([\d.]+)(?:px)?"/);
  const height = source.match(/\bheight="([\d.]+)(?:px)?"/);
  if (width && height) return [Number(width[1]), Number(height[1])];

  const viewBox = source.match(/\bviewBox="[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)"/);
  if (viewBox) return [Number(viewBox[1]), Number(viewBox[2])];
  return null;
}

function pngSize(buffer: Buffer): [number, number] | null {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

function jpegSize(buffer: Buffer): [number, number] | null {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1]!;
    const length = buffer.readUInt16BE(offset + 2);
    // SOF0..SOF15, excluding the non-frame markers DHT, JPG and DAC.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
    }
    offset += 2 + length;
  }
  return null;
}

function gifSize(buffer: Buffer): [number, number] | null {
  if (buffer.length < 10 || buffer.toString("ascii", 0, 3) !== "GIF") return null;
  return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)];
}

function intrinsicSize(file: string): [number, number] | null {
  const buffer = readFileSync(file);
  switch (path.extname(file).toLowerCase()) {
    case ".svg":
      return svgSize(buffer.toString("utf8"));
    case ".png":
      return pngSize(buffer);
    case ".jpg":
    case ".jpeg":
      return jpegSize(buffer);
    case ".gif":
      return gifSize(buffer);
    default:
      return null;
  }
}

export function rehypeImageDimensions(options?: { publicDir?: string }) {
  const publicDir = options?.publicDir ?? path.resolve("public");
  const cache = new Map<string, [number, number] | null>();

  return (tree: HastNode): void => {
    walk(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "img" || !node.properties) return;

      const source = node.properties.src;
      if (typeof source !== "string" || !source.startsWith("/") || source.startsWith("//")) return;

      node.properties.loading ??= "lazy";
      node.properties.decoding ??= "async";
      if (node.properties.width && node.properties.height) return;

      if (!cache.has(source)) {
        const file = path.join(publicDir, source.split("?")[0] ?? "");
        // Never read outside public/, whatever the markdown says.
        const inside = file.startsWith(`${publicDir}${path.sep}`);
        try {
          cache.set(source, inside ? intrinsicSize(file) : null);
        } catch {
          cache.set(source, null);
        }
      }

      const size = cache.get(source);
      if (!size) return;
      node.properties.width = size[0];
      node.properties.height = size[1];
    });
  };
}

export default rehypeImageDimensions;
