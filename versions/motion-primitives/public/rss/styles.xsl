<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="utf-8" indent="yes" />
  <xsl:template match="/">
    <xsl:variable name="lang" select="/rss/channel/language" />
    <html>
      <xsl:attribute name="lang"><xsl:value-of select="$lang" /></xsl:attribute>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /></title>
        <style>
          :root {
            color-scheme: dark;
            --bg: #000000;
            --card: #0d0d0f;
            --fg: #ededed;
            --muted: #a1a1a1;
            --border: #262626;
            --accent: #22c55e;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--fg);
            font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
          .banner {
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent);
            border-radius: 0.5rem;
            background: var(--card);
            padding: 1rem 1.25rem;
            margin-bottom: 2.5rem;
            color: var(--muted);
            font-size: 0.9rem;
          }
          .banner strong { color: var(--fg); }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--accent);
            margin: 0 0 0.4rem;
          }
          h1 { font-size: 1.9rem; line-height: 1.2; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
          .lead { color: var(--muted); margin: 0 0 0.5rem; }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .items { list-style: none; padding: 0; margin: 2rem 0 0; }
          .item { padding: 1.1rem 0; border-top: 1px solid var(--border); }
          .item h2 { font-size: 1.1rem; margin: 0 0 0.3rem; }
          .item h2 a { color: var(--fg); }
          .item h2 a:hover { color: var(--accent); }
          .item p { margin: 0.25rem 0 0; color: var(--muted); font-size: 0.92rem; }
          .date { font-size: 0.78rem; color: var(--muted); font-variant-numeric: tabular-nums; }
          code { font-family: ui-monospace, "JetBrains Mono", monospace; background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 0.1rem 0.35rem; font-size: 0.85em; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <xsl:choose>
              <xsl:when test="$lang = 'en'">
                <strong>This is an RSS feed.</strong> Subscribe by copying the page URL into your feed reader
                to receive new posts automatically. Learn more about
                <a href="https://aboutfeeds.com/" target="_blank" rel="noopener">web feeds</a>.
              </xsl:when>
              <xsl:otherwise>
                <strong>Ceci est un flux RSS.</strong> Abonnez-vous en copiant l'URL de cette page dans votre
                lecteur de flux pour recevoir automatiquement les nouveaux articles. En savoir plus sur les
                <a href="https://aboutfeeds.com/" target="_blank" rel="noopener">flux web</a>.
              </xsl:otherwise>
            </xsl:choose>
          </div>

          <p class="eyebrow">
            <xsl:choose>
              <xsl:when test="$lang = 'en'">RSS feed</xsl:when>
              <xsl:otherwise>Flux RSS</xsl:otherwise>
            </xsl:choose>
          </p>
          <h1><xsl:value-of select="/rss/channel/title" /></h1>
          <p class="lead"><xsl:value-of select="/rss/channel/description" /></p>
          <p>
            <a target="_blank" rel="noopener">
              <xsl:attribute name="href"><xsl:value-of select="/rss/channel/link" /></xsl:attribute>
              <xsl:choose>
                <xsl:when test="$lang = 'en'">Visit the website &#8594;</xsl:when>
                <xsl:otherwise>Visiter le site &#8594;</xsl:otherwise>
              </xsl:choose>
            </a>
          </p>

          <ul class="items">
            <xsl:for-each select="/rss/channel/item">
              <li class="item">
                <h2>
                  <a target="_blank" rel="noopener">
                    <xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
                    <xsl:value-of select="title" />
                  </a>
                </h2>
                <p class="date"><xsl:value-of select="pubDate" /></p>
                <p><xsl:value-of select="description" /></p>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
