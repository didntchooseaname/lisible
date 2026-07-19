<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="utf-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS feed</title>
        <style>
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0; background: #0a0a0b; color: #e4e4e7;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          .badge {
            display: inline-flex; align-items: center; gap: .4rem;
            font-size: .72rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
            color: #22c55e; border: 1px solid #22c55e40; border-radius: 999px; padding: .25rem .6rem;
          }
          h1 { font-size: 1.9rem; line-height: 1.2; margin: 1rem 0 .3rem; letter-spacing: -.02em; }
          .tagline { color: #a1a1aa; margin: 0 0 1.5rem; }
          .note {
            border: 1px solid #27272a; background: #131315; border-radius: .6rem;
            padding: 1rem 1.15rem; margin: 0 0 2rem; font-size: .92rem; color: #d4d4d8;
          }
          .note strong { color: #fafafa; }
          .note code {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            background: #0a0a0b; border: 1px solid #27272a; border-radius: .35rem;
            padding: .1rem .35rem; font-size: .85em;
          }
          h2 { font-size: .95rem; text-transform: uppercase; letter-spacing: .05em; color: #a1a1aa; margin: 0 0 .75rem; }
          ul { list-style: none; margin: 0; padding: 0; }
          li { border-top: 1px solid #27272a; padding: 1rem 0; }
          li a { color: #fafafa; text-decoration: none; font-weight: 600; font-size: 1.08rem; }
          li a:hover { color: #22c55e; }
          .date { display: block; color: #71717a; font-size: .8rem; margin-top: .2rem; }
          .desc { color: #a1a1aa; margin: .4rem 0 0; font-size: .92rem; }
          .home { display: inline-block; margin-top: 2rem; color: #22c55e; text-decoration: none; font-weight: 600; }
          .home:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <span class="badge">RSS feed</span>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="tagline"><xsl:value-of select="/rss/channel/description"/></p>
          <div class="note">
            <p style="margin:0 0 .5rem"><strong>What is an RSS feed?</strong></p>
            <p style="margin:0">An RSS feed lets you follow new posts without relying on a social network or a newsletter. Copy this page's URL into a feed reader (for example <code>NetNewsWire</code>, <code>Feedly</code> or <code>Thunderbird</code>) to be notified whenever something new is published.</p>
          </div>
          <h2>Recent posts</h2>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <span class="date"><xsl:value-of select="pubDate"/></span>
                <p class="desc"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ul>
          <a class="home" href="{/rss/channel/link}">Back to the site</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
