declare const __FEATURE_HEADING_ANCHORS__: boolean;
declare const __FEATURE_MERMAID__: boolean;
declare const __FEATURE_DRAWIO__: boolean;
declare const __FEATURE_IMAGE_ZOOM__: boolean;

if (__FEATURE_HEADING_ANCHORS__) {
  import("./heading-anchors");
}
if (__FEATURE_MERMAID__) {
  import("./mermaid");
}
if (__FEATURE_DRAWIO__) {
  import("./drawio");
}
if (__FEATURE_IMAGE_ZOOM__) {
  import("./image-lightbox");
}
