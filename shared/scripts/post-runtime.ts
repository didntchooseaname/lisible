declare const __FEATURE_IMAGE_ZOOM__: boolean;
declare const __FEATURE_MERMAID__: boolean;
declare const __FEATURE_DRAWIO__: boolean;
declare const __FEATURE_HEADING_ANCHORS__: boolean;

/**
 * Post page runtime loader: pulls in the client scripts a post needs, gated by
 * the build time feature flags so disabled features cost zero bytes. The "@/"
 * alias resolves inside the variant that imports this module, so every variant
 * keeps its own implementations of the four scripts.
 */
if (__FEATURE_IMAGE_ZOOM__) void import("@/scripts/image-lightbox");
if (__FEATURE_MERMAID__) void import("@/scripts/mermaid");
if (__FEATURE_DRAWIO__) void import("@/scripts/drawio");
if (__FEATURE_HEADING_ANCHORS__) void import("@/scripts/heading-anchors");

export {};
