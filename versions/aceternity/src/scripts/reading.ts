declare const __F_IMAGEZOOM__: boolean;
declare const __F_HEADINGANCHORS__: boolean;
declare const __F_MERMAID__: boolean;
declare const __F_DRAWIO__: boolean;

if (__F_IMAGEZOOM__) import("./image-lightbox");
if (__F_HEADINGANCHORS__) import("./heading-anchors");
if (__F_MERMAID__) import("./mermaid");
if (__F_DRAWIO__) import("./drawio");
