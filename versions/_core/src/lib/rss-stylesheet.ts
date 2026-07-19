import { SITE } from "#src/site.config";

export function rssStylesheet(): string {
  const title = SITE.title;
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <xsl:variable name="lang" select="/rss/channel/language"/>
    <html>
      <xsl:attribute name="lang">
        <xsl:choose>
          <xsl:when test="starts-with($lang, 'en')">en</xsl:when>
          <xsl:otherwise>fr</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #ffffff;
            --fg: #0f1115;
            --muted: #5b6472;
            --border: #e4e7ec;
            --card: #f7f8fa;
            --accent: #16a34a;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0b0d10;
              --fg: #e6e9ef;
              --muted: #99a2b3;
              --border: #23272f;
              --card: #12151a;
              --accent: #22c55e;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--fg);
            font-family: ui-sans-serif, system-ui, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 5rem; }
          .banner {
            border: 1px solid var(--border);
            background: var(--card);
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            display: flex;
            gap: 0.85rem;
            align-items: flex-start;
            margin-bottom: 2.5rem;
          }
          .banner svg { flex: 0 0 auto; margin-top: 0.15rem; color: var(--accent); }
          .banner p { margin: 0; font-size: 0.9rem; color: var(--muted); }
          .banner strong { color: var(--fg); }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--accent);
            margin: 0 0 0.4rem;
          }
          h1 { font-size: 1.9rem; line-height: 1.2; margin: 0 0 0.6rem; letter-spacing: -0.02em; }
          .lede { color: var(--muted); margin: 0 0 1rem; }
          .home {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--accent);
            text-decoration: none;
          }
          .home:hover { text-decoration: underline; }
          h2 {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--muted);
            margin: 3rem 0 0.5rem;
            border-top: 1px solid var(--border);
            padding-top: 1.5rem;
          }
          ul { list-style: none; margin: 0; padding: 0; }
          li { padding: 1rem 0; border-bottom: 1px solid var(--border); }
          li a { color: var(--fg); text-decoration: none; font-weight: 600; font-size: 1.05rem; }
          li a:hover { color: var(--accent); }
          .meta { color: var(--muted); font-size: 0.8rem; margin: 0.15rem 0 0; }
          .desc { color: var(--muted); font-size: 0.92rem; margin: 0.4rem 0 0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9"/>
              <path d="M4 4a16 16 0 0 1 16 16"/>
              <circle cx="5" cy="19" r="1"/>
            </svg>
            <p>
              <xsl:choose>
                <xsl:when test="starts-with($lang, 'en')">
                  <strong>This is an RSS feed.</strong> Copy this page URL into a feed reader
                  (such as NetNewsWire, Feedly or Reeder) to follow new posts without email or
                  an account. The raw content below is meant for that reader.
                </xsl:when>
                <xsl:otherwise>
                  <strong>Ceci est un flux RSS.</strong> Copiez l'adresse de cette page dans un
                  lecteur de flux (NetNewsWire, Feedly ou Reeder par exemple) pour suivre les
                  nouveaux articles sans email ni compte. Le contenu ci-dessous est destine a
                  ce lecteur.
                </xsl:otherwise>
              </xsl:choose>
            </p>
          </div>

          <p class="eyebrow">${title}</p>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="lede"><xsl:value-of select="/rss/channel/description"/></p>
          <a class="home" href="{/rss/channel/link}">
            <xsl:choose>
              <xsl:when test="starts-with($lang, 'en')">Visit the website</xsl:when>
              <xsl:otherwise>Aller sur le site</xsl:otherwise>
            </xsl:choose>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>

          <h2>
            <xsl:choose>
              <xsl:when test="starts-with($lang, 'en')">Latest posts</xsl:when>
              <xsl:otherwise>Derniers articles</xsl:otherwise>
            </xsl:choose>
          </h2>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <p class="meta"><xsl:value-of select="pubDate"/></p>
                <p class="desc"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
}
