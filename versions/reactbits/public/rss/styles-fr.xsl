<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="fr">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - Flux RSS</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <style>
          :root { color-scheme: light dark; --bg:#ffffff; --fg:#171717; --muted:#737373; --border:#e5e5e5; --card:#fafafa; --accent:#16a34a; }
          @media (prefers-color-scheme: dark) { :root { --bg:#0a0a0a; --fg:#fafafa; --muted:#a3a3a3; --border:#262626; --card:#141414; --accent:#22c55e; } }
          * { box-sizing: border-box; }
          body { margin:0; background:var(--bg); color:var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; line-height:1.6; }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
          .banner { border:1px solid var(--border); background:var(--card); border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:2.5rem; }
          .banner h2 { margin:0 0 .35rem; font-size:.95rem; }
          .banner p { margin:0; color:var(--muted); font-size:.9rem; }
          .banner code { background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:.1rem .35rem; font-size:.85em; }
          h1 { font-size:1.9rem; letter-spacing:-.02em; margin:0 0 .35rem; }
          .lead { color:var(--muted); margin:0 0 2.5rem; }
          .accent { display:inline-block; width:2.5rem; height:.4rem; border-radius:4px; background:var(--accent); margin-bottom:1.25rem; }
          .item { border-top:1px solid var(--border); padding:1.5rem 0; }
          .item h3 { margin:0 0 .35rem; font-size:1.15rem; }
          .item a { color:var(--fg); text-decoration:none; }
          .item a:hover { color:var(--accent); }
          .item p { margin:0 0 .5rem; color:var(--muted); font-size:.95rem; }
          .date { color:var(--muted); font-size:.8rem; font-variant-numeric: tabular-nums; }
          .home { display:inline-flex; align-items:center; gap:.4rem; margin-top:.5rem; color:var(--accent); text-decoration:none; font-weight:600; font-size:.9rem; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <h2>Ceci est un flux RSS</h2>
            <p>Un flux RSS permet de suivre ce blog dans un lecteur dedie. Copiez l'adresse de cette page dans votre lecteur (<code>Feedly</code>, <code>NetNewsWire</code>, <code>Thunderbird</code>...) pour recevoir les nouveaux articles automatiquement.</p>
          </div>
          <span class="accent"></span>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="lead"><xsl:value-of select="/rss/channel/description"/></p>
          <a class="home" href="{/rss/channel/link}">Visiter le site &#8594;</a>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h3><a href="{link}"><xsl:value-of select="title"/></a></h3>
              <p><xsl:value-of select="description"/></p>
              <span class="date"><xsl:value-of select="substring(pubDate, 1, 16)"/></span>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
