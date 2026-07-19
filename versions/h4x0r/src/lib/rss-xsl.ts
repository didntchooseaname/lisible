import { platformStrings } from "#src/i18n/platform";
import { SITE } from "#src/site.config";
import type { Locale } from "#src/i18n/ui";

export function rssStylesheet(locale: Locale): string {
  const s = platformStrings[locale].rssView;
  return `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="${locale}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title><xsl:value-of select="/rss/channel/title"/></title>
<style>
  :root {
    --background: #000000;
    --card: #0a0a0a;
    --foreground: #fafafa;
    --muted-foreground: #a3a3a3;
    --border: #171717;
    --accent: ${SITE.accent};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: ui-sans-serif, system-ui, sans-serif;
    line-height: 1.6;
  }
  .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  .about {
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    background: var(--card);
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    color: var(--muted-foreground);
  }
  .about strong { color: var(--foreground); display: block; margin-bottom: 0.35rem; }
  h1 {
    margin: 2rem 0 0.25rem;
    font-size: 1.6rem;
    letter-spacing: 0.04em;
  }
  h1 .prompt { color: var(--accent); font-family: ui-monospace, monospace; }
  .desc { margin: 0; color: var(--muted-foreground); }
  .site-link {
    display: inline-block;
    margin-top: 0.75rem;
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid var(--accent);
    padding-bottom: 1px;
  }
  h2 {
    margin: 2.5rem 0 1rem;
    font-size: 0.8rem;
    font-family: ui-monospace, monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--muted-foreground);
  }
  .item {
    border: 1px solid var(--border);
    background: var(--card);
    padding: 1rem 1.25rem;
    margin-bottom: 0.75rem;
  }
  .item a {
    color: var(--foreground);
    font-weight: 600;
    text-decoration: none;
  }
  .item a:hover { color: var(--accent); }
  .item .date {
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted-foreground);
    margin: 0 0 0.35rem;
  }
  .item p { margin: 0.35rem 0 0; font-size: 0.9rem; color: var(--muted-foreground); }
</style>
</head>
<body>
<div class="wrap">
  <div class="about">
    <strong>${s.aboutTitle}</strong>
    ${s.aboutText}
  </div>
  <h1><span class="prompt">&gt;_</span>&#160;<xsl:value-of select="/rss/channel/title"/></h1>
  <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
  <a class="site-link">
    <xsl:attribute name="href"><xsl:value-of select="/rss/channel/link"/></xsl:attribute>
    ${s.visitSite}
  </a>
  <h2>${s.itemsTitle}</h2>
  <xsl:for-each select="/rss/channel/item">
    <div class="item">
      <p class="date">${s.published} <xsl:value-of select="substring(pubDate, 1, 16)"/></p>
      <a>
        <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
        <xsl:value-of select="title"/>
      </a>
      <p><xsl:value-of select="description"/></p>
    </div>
  </xsl:for-each>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
`;
}
