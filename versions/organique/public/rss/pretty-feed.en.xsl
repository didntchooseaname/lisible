<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg: #ffffff; --fg: #18181b; --muted: #71717a;
            --border: #e4e4e7; --card: #fafafa; --accent: #16a34a;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0a0a0a; --fg: #fafafa; --muted: #a1a1aa;
              --border: #27272a; --card: #141414; --accent: #22c55e;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0; background: var(--bg); color: var(--fg);
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          .banner {
            border: 1px solid var(--border); border-radius: 0.75rem;
            background: var(--card); padding: 1rem 1.25rem; margin-bottom: 2rem;
            font-size: 0.9rem; color: var(--muted);
          }
          .banner strong { color: var(--fg); }
          h1 { font-size: 1.8rem; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
          .desc { color: var(--muted); margin: 0 0 2rem; }
          .home { color: var(--accent); text-decoration: none; font-weight: 600; }
          .home:hover { text-decoration: underline; }
          ul { list-style: none; margin: 0; padding: 0; }
          li { border-top: 1px solid var(--border); padding: 1.25rem 0; }
          .item-title { font-size: 1.15rem; font-weight: 650; margin: 0 0 0.25rem; }
          .item-title a { color: var(--fg); text-decoration: none; }
          .item-title a:hover { color: var(--accent); }
          time { color: var(--muted); font-size: 0.82rem; }
          .item-desc { color: var(--muted); margin: 0.4rem 0 0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <strong>This is an RSS feed.</strong> Copy this page's address into your
            feed reader (Feedly, NetNewsWire, Thunderbird...) to get new posts
            automatically, with no account and no algorithm.
          </div>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
          <p>
            <a class="home" href="{/rss/channel/link}">Back to the site</a>
          </p>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <p class="item-title">
                  <a href="{link}"><xsl:value-of select="title"/></a>
                </p>
                <time><xsl:value-of select="pubDate"/></time>
                <p class="item-desc"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ul>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
