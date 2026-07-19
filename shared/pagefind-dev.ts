const PAGEFIND_MODULE_PATH = "/pagefind/pagefind.js";
const VIRTUAL_PAGEFIND_ID = "\0lisible:pagefind-dev";

const DEV_MODULE = `
export async function options() {}
export async function init() {}
export async function search() {
  return { results: [], unfilteredResultCount: 0, filters: {}, totalFilters: {}, timings: [] };
}
export async function debouncedSearch() {
  return null;
}
`;

type DevRequest = { url?: string };
type DevResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body: string): void;
};
type DevServer = {
  middlewares: {
    use(
      handler: (request: DevRequest, response: DevResponse, next: () => void) => void,
    ): void;
  };
};

/**
 * Keeps Pagefind's build-only browser module from breaking Astro's dev server.
 * astro-pagefind still owns indexing and production assets during `astro build`.
 */
export default function pagefindDev() {
  return {
    name: "lisible:pagefind-dev",
    apply: "serve" as const,
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === PAGEFIND_MODULE_PATH) return VIRTUAL_PAGEFIND_ID;
    },
    load(id: string) {
      if (id === VIRTUAL_PAGEFIND_ID) return DEV_MODULE;
    },
    configureServer(server: DevServer) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split("?", 1)[0];
        if (pathname !== PAGEFIND_MODULE_PATH) return next();

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/javascript; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        response.end(DEV_MODULE);
      });
    },
  };
}
