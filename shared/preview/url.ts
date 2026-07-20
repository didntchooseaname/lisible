function splitSuffix(path: string): [string, string] {
  const index = path.search(/[?#]/);
  return index === -1 ? [path, ""] : [path.slice(0, index), path.slice(index)];
}

export function previewBase(): string {
  const value = import.meta.env.BASE_URL || "/";
  return value === "/" ? value : `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

export function withPreviewBase(path: string): string {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) return path;
  const base = previewBase();
  if (base === "/") return path.startsWith("/") ? path : `/${path}`;

  const [pathname, suffix] = splitSuffix(path);
  const absolute = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (absolute === base.slice(0, -1) || absolute.startsWith(base)) return `${absolute}${suffix}`;
  return `${base.slice(0, -1)}${absolute}${suffix}`;
}

export function withPreviewLocaleBase(locale: "fr" | "en", path: string, url: string): string {
  const isFrenchHome = locale === "fr" && path.replace(/^\/+|\/+$/g, "") === "";
  if (previewBase() !== "/" && isFrenchHome) return withPreviewBase("/landing/french/");
  return withPreviewBase(url);
}

export function withoutPreviewBase(path: string): string {
  const base = previewBase();
  if (base === "/" || !path.startsWith(base)) return path || "/";
  return `/${path.slice(base.length).replace(/^\/+/, "")}`;
}
