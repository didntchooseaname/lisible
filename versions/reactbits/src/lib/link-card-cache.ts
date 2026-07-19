import * as fs from "node:fs/promises";
import path from "node:path";
import type { OgObject } from "open-graph-scraper/types";

const CACHE_FILE = path.resolve(".link-card-cache.json");

let cache: Record<string, OgObject | null> | null = null;
let dirty = false;

const inflight = new Map<string, Promise<OgObject | null>>();

export async function loadCache(): Promise<void> {
  if (cache !== null) return;
  try {
    const content = await fs.readFile(CACHE_FILE, "utf-8");
    cache = JSON.parse(content);
  } catch {
    cache = {};
  }
}

export function getCachedMetadata(url: string): OgObject | null | undefined {
  return cache?.[url];
}

export function setCachedMetadata(url: string, metadata: OgObject | null): void {
  if (!cache) cache = {};
  cache[url] = metadata;
  dirty = true;
}

export function getInflight(url: string): Promise<OgObject | null> | undefined {
  return inflight.get(url);
}

export function setInflight(url: string, promise: Promise<OgObject | null>): void {
  inflight.set(url, promise);
  promise.finally(() => inflight.delete(url));
}

export async function saveCache(): Promise<void> {
  if (!dirty || !cache) return;
  const sorted = Object.keys(cache)
    .sort()
    .reduce<Record<string, OgObject | null>>((acc, key) => {
      acc[key] = cache![key];
      return acc;
    }, {});
  await fs.writeFile(CACHE_FILE, JSON.stringify(sorted, null, 2));
  dirty = false;
}
