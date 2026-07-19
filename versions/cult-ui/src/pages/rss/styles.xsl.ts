import type { APIRoute } from "astro";
import { FEATURES } from "@/site.config";

const xsl = `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="fr">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title><xsl:value-of select="/rss/channel/title"/> - Flux RSS</title>
        <style>
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0; padding: 2.5rem 1.25rem 4rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0a0a0a; color: #e5e5e5; line-height: 1.6;
          }
          main { max-width: 44rem; margin: 0 auto; }
          .note {
            border: 1px solid #262626; border-left: 3px solid #22c55e;
            border-radius: 10px; background: #111; padding: 1rem 1.25rem;
            margin-bottom: 2.5rem; font-size: 0.95rem; color: #a3a3a3;
          }
          .note strong { color: #e5e5e5; }
          .note code { color: #22c55e; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          h1 { font-size: 1.6rem; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
          .desc { color: #a3a3a3; margin: 0 0 2rem; }
          .visit { display: inline-block; margin-bottom: 2.5rem; color: #22c55e; text-decoration: none; font-weight: 600; }
          .visit:hover { text-decoration: underline; }
          ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
          li { border: 1px solid #262626; border-radius: 12px; background: #111; padding: 1.1rem 1.25rem; }
          li a { color: #f5f5f5; text-decoration: none; font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; }
          li a:hover { color: #22c55e; }
          .date { display: block; color: #737373; font-size: 0.8rem; margin: 0.25rem 0 0.5rem; }
          .item-desc { color: #a3a3a3; margin: 0; font-size: 0.95rem; }
        </style>
      </head>
      <body>
        <main>
          <div class="note">
            <strong>Ceci est un flux RSS / This is an RSS feed.</strong>
            Abonnez-vous en collant l'adresse de cette page dans un lecteur RSS.
            Subscribe by pasting this page's address into an RSS reader.
          </div>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
          <a class="visit" href="{/rss/channel/link}">&#8594; <xsl:value-of select="/rss/channel/link"/></a>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <span class="date"><xsl:value-of select="pubDate"/></span>
                <p class="item-desc"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ul>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;

export const GET: APIRoute = () => {
  if (!FEATURES.styledRss) return new Response(null, { status: 404 });
  return new Response(xsl, {
    headers: { "Content-Type": "application/xslt+xml; charset=utf-8" },
  });
};
