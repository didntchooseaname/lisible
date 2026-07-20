import { getRelativeLocaleUrl } from "astro:i18n";
import { withPreviewLocaleBase } from "../../../../shared/preview/url";
import { cardStrings } from "./cards";
import { codeStrings } from "./code";
import { contentStrings } from "./content";
import { platformStrings } from "./platform";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const ogLocales: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
};

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

const fr = {
  site: {
    tagline: "Un framework de blog minimaliste et rapide, pensé pour la lecture.",
    description:
      "Un blog technique sur le web moderne: Astro, performance, accessibilité et typographie éditoriale.",
  },
  nav: {
    blog: "Blog",
    tags: "Tags",
    about: "À propos",
    archives: "Archives",
    series: "Séries",
    main: "Navigation principale",
  },
  home: {
    metaTitle: "Lisible, le framework de blog pensé pour la lecture",
    featured: "À la une",
    latest: "Derniers articles",
    allPosts: "Tous les articles",
  },
  blog: {
    title: "Blog",
    description: "Tous les articles du blog, groupés par année.",
  },
  post: {
    publishedOn: "Publié le",
    updatedOn: "Mis à jour le",
    readingTime: (min: number) => `${min} min de lecture`,
    toc: "Sur cette page",
    prev: "Article précédent",
    next: "Article suivant",
    pagination: "Navigation entre articles",
    draft: "Brouillon",
    tags: "Tags",
  },
  tags: {
    title: "Tags",
    description: "Tous les tags du blog, avec le nombre d'articles pour chacun.",
    taggedWith: (tag: string) => `Articles tagués « ${tag} »`,
    tagDescription: (tag: string) => `Tous les articles tagués « ${tag} », triés du plus récent au plus ancien.`,
    postsCount: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
    all: "Tous les tags",
  },
  about: {
    title: "À propos",
    description: "Qui écrit ici, et pourquoi ce blog existe.",
    paragraphs: [
      "Bonjour, je suis l'auteur de ce blog. J'écris ici sur le web moderne: la performance, l'accessibilité, le design d'interfaces et l'outillage qui rend tout cela agréable.",
      "Ce blog est aussi une démonstration technique: généré avec Astro, entièrement statique, navigable sans rechargement de page, bilingue et sombre par défaut. Le code privilégie la sobriété: peu de JavaScript, une typographie soignée et des pages qui se chargent vite.",
      "Vous pouvez explorer les articles par tags, utiliser la recherche plein texte (Ctrl+K) ou vous abonner au flux RSS pour suivre les nouveautés.",
    ],
  },
  search: {
    title: "Recherche",
    placeholder: "Rechercher un article...",
    hint: "Tapez pour rechercher dans les articles.",
    noResults: "Aucun résultat.",
    devNotice: "La recherche est indexée au build: lancez bun run build puis bun run preview pour l'essayer.",
  },
  newsletter: {
    title: "Restez au courant",
    description: "Un email occasionnel quand un nouvel article sort. Pas de spam, désabonnement en un clic.",
    emailLabel: "Adresse email",
    placeholder: "vous@exemple.fr",
    button: "S'abonner",
    note: "Composant de démonstration: aucune inscription n'est réellement envoyée.",
  },
  notFound: {
    title: "Page introuvable",
    message: "Cette page n'existe pas ou a été déplacée.",
    backHome: "Retour à l'accueil",
  },
  footer: {
    poweredBy: "Propulsé par",
    poweredByAnd: "et",
    github: "GitHub",
    rss: "Flux RSS",
  },
  code: codeStrings.fr,
  content: contentStrings.fr,
  platform: platformStrings.fr,
  reading: {
    related: "À lire ensuite",
    anchorCopy: "Copier le lien vers cette section",
    anchorCopied: "Lien copié",
    editOnGithub: "Modifier cette page sur GitHub",
    spoilerReveal: "Révéler le contenu masqué",
    lightbox: {
      open: "Agrandir l'image",
      close: "Fermer la visionneuse",
      prev: "Image précédente",
      next: "Image suivante",
      zoomIn: "Zoomer",
      zoomOut: "Dézoomer",
      reset: "Réinitialiser le zoom",
      counter: (current: number, total: number) => `Image ${current} sur ${total}`,
    },
  },
  accent: {
    open: "Choisir la couleur d'accent",
    title: "Couleur d'accent",
    reset: "Réinitialiser",
    svLabel: "Saturation et luminosité",
    svValueText: "Saturation {s} %, luminosité {v} %",
    hueLabel: "Teinte",
    hueValueText: "Teinte {h}°",
  },
  cards: cardStrings.fr,
  cyber: {
    boot: {
      lines: [
        "LISIBLE BIOS v6.0 :: séquence d'initialisation",
        "chargement des modules: astro, i18n, rss ........ OK",
        "montage de /dev/blog (fr, en) ................... OK",
        "vérification de l'intégrité typographique ....... OK",
        "liaison établie. bienvenue, opérateur.",
      ],
      granted: "ACCÈS AUTORISÉ",
      skip: "Passer [Échap]",
    },
    hud: {
      online: "EN LIGNE",
      sys: "SYS:OK",
      pos: "POS",
      scroll: "DÉFIL",
      signal: "SIGNAL:STABLE",
      mode: "MODE:STATIQUE",
    },
    home: {
      prompt: "operator@lisible:~$ ./réveil --protocole complet",
      rotateWords: ["LISIBLE", "RAPIDE", "ACCESSIBLE", "BILINGUE"],
      terminalTitle: "transmissions :: tail -f",
      terminalCmd: "tail -f /var/log/blog/transmissions.log",
      terminalOk: "flux ouvert. dernières transmissions:",
      telemetry: "Télémétrie",
      statPosts: "articles publiés",
      statTags: "tags actifs",
      statWords: "mots transmis",
      statMinutes: "minutes de lecture",
      integrity: "intégrité système",
      tagStream: "flux de tags",
      ctaBlog: "Parcourir les archives",
      ctaAbout: "Dossier opérateur",
    },
    blog: {
      velocity: "ARCHIVES :: JOURNAL :: TRANSMISSIONS :: ",
      indexLabel: "index des transmissions",
      countLabel: (n: number) => `${n} entrées consignées`,
    },
    tags: {
      orbitLabel: "constellation des tags",
      scanLine: 'operator@lisible:~$ grep -rc "#tag" ./blog',
    },
    about: {
      dossier: "Dossier :: opérateur",
      treeLabel: "arborescence du système",
      modulesLabel: "modules embarqués",
      lensLabel: "analyse: architecture en îlots",
      lensHint: "Survolez le schéma pour l'inspecter à la loupe.",
      manifesto:
        "Écrire pour être lu. Construire pour durer. Chaque octet au service de la lecture, chaque page rendue avant même que le réseau ne cligne des yeux.",
    },
    notFound: {
      crash: "SEGMENTATION FAULT",
      dump: [
        "signal 11: SIGSEGV (accès mémoire invalide)",
        "  at 0x00000404 route_resolve()",
        "  at 0x1F4C0DE render_page()",
        "core dumped :: la page demandée n'existe pas",
      ],
      reboot: "Redémarrer vers l'accueil",
    },
    post: {
      catPrefix: "operator@lisible:~$ cat",
      tocTitle: "INDEX",
      eof: "EOF :: fin de transmission",
    },
  },
  a11y: {
    skipToContent: "Aller au contenu principal",
    toggleTheme: "Changer de thème",
    openSearch: "Ouvrir la recherche (Ctrl+K)",
    closeSearch: "Fermer la recherche",
    backToTop: "Retour en haut de page",
    languageSwitcher: "Choix de la langue",
    frenchVersion: "Version française",
    englishVersion: "English version",
  },
};

type Dict = typeof fr;

const en: Dict = {
  site: {
    tagline: "A minimal, fast blog framework built for reading.",
    description:
      "A technical blog about the modern web: Astro, performance, accessibility and editorial typography.",
  },
  nav: {
    blog: "Blog",
    tags: "Tags",
    about: "About",
    archives: "Archives",
    series: "Series",
    main: "Main navigation",
  },
  home: {
    metaTitle: "Lisible, the blog framework built for reading",
    featured: "Featured",
    latest: "Latest posts",
    allPosts: "All posts",
  },
  blog: {
    title: "Blog",
    description: "All the posts on this blog, grouped by year.",
  },
  post: {
    publishedOn: "Published on",
    updatedOn: "Updated on",
    readingTime: (min: number) => `${min} min read`,
    toc: "On this page",
    prev: "Previous post",
    next: "Next post",
    pagination: "Post navigation",
    draft: "Draft",
    tags: "Tags",
  },
  tags: {
    title: "Tags",
    description: "All the tags on this blog, with the number of posts for each.",
    taggedWith: (tag: string) => `Posts tagged "${tag}"`,
    tagDescription: (tag: string) => `All the posts tagged "${tag}", sorted from newest to oldest.`,
    postsCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
    all: "All tags",
  },
  about: {
    title: "About",
    description: "Who writes here, and why this blog exists.",
    paragraphs: [
      "Hi, I am the author of this blog. I write here about the modern web: performance, accessibility, interface design and the tooling that makes it all enjoyable.",
      "This blog is also a technical showcase: built with Astro, fully static, navigable without any page reload, bilingual and dark by default. The code favors restraint: little JavaScript, careful typography and pages that load fast.",
      "You can browse posts by tags, use the full text search (Ctrl+K) or subscribe to the RSS feed to follow new posts.",
    ],
  },
  search: {
    title: "Search",
    placeholder: "Search articles...",
    hint: "Type to search the articles.",
    noResults: "No results.",
    devNotice: "Search is indexed at build time: run bun run build then bun run preview to try it.",
  },
  newsletter: {
    title: "Stay in the loop",
    description: "An occasional email when a new post is out. No spam, unsubscribe in one click.",
    emailLabel: "Email address",
    placeholder: "you@example.com",
    button: "Subscribe",
    note: "Demo component: no signup is actually sent.",
  },
  notFound: {
    title: "Page not found",
    message: "This page does not exist or has moved.",
    backHome: "Back to the home page",
  },
  footer: {
    poweredBy: "Powered by",
    poweredByAnd: "and",
    github: "GitHub",
    rss: "RSS feed",
  },
  code: codeStrings.en,
  content: contentStrings.en,
  platform: platformStrings.en,
  reading: {
    related: "Read next",
    anchorCopy: "Copy link to this section",
    anchorCopied: "Link copied",
    editOnGithub: "Edit this page on GitHub",
    spoilerReveal: "Reveal hidden content",
    lightbox: {
      open: "Enlarge image",
      close: "Close viewer",
      prev: "Previous image",
      next: "Next image",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      reset: "Reset zoom",
      counter: (current: number, total: number) => `Image ${current} of ${total}`,
    },
  },
  accent: {
    open: "Choose accent color",
    title: "Accent color",
    reset: "Reset",
    svLabel: "Saturation and brightness",
    svValueText: "Saturation {s}%, brightness {v}%",
    hueLabel: "Hue",
    hueValueText: "Hue {h}°",
  },
  cards: cardStrings.en,
  cyber: {
    boot: {
      lines: [
        "LISIBLE BIOS v6.0 :: initialization sequence",
        "loading modules: astro, i18n, rss ............... OK",
        "mounting /dev/blog (fr, en) ..................... OK",
        "verifying typographic integrity ................. OK",
        "link established. welcome, operator.",
      ],
      granted: "ACCESS GRANTED",
      skip: "Skip [Esc]",
    },
    hud: {
      online: "ONLINE",
      sys: "SYS:OK",
      pos: "POS",
      scroll: "SCROLL",
      signal: "SIGNAL:STABLE",
      mode: "MODE:STATIC",
    },
    home: {
      prompt: "operator@lisible:~$ ./wake --full-protocol",
      rotateWords: ["READABLE", "FAST", "ACCESSIBLE", "BILINGUAL"],
      terminalTitle: "transmissions :: tail -f",
      terminalCmd: "tail -f /var/log/blog/transmissions.log",
      terminalOk: "stream open. latest transmissions:",
      telemetry: "Telemetry",
      statPosts: "published posts",
      statTags: "active tags",
      statWords: "words transmitted",
      statMinutes: "minutes of reading",
      integrity: "system integrity",
      tagStream: "tag stream",
      ctaBlog: "Browse the archives",
      ctaAbout: "Operator file",
    },
    blog: {
      velocity: "ARCHIVES :: LOGBOOK :: TRANSMISSIONS :: ",
      indexLabel: "transmission index",
      countLabel: (n: number) => `${n} entries logged`,
    },
    tags: {
      orbitLabel: "tag constellation",
      scanLine: 'operator@lisible:~$ grep -rc "#tag" ./blog',
    },
    about: {
      dossier: "File :: operator",
      treeLabel: "system tree",
      modulesLabel: "embedded modules",
      lensLabel: "analysis: islands architecture",
      lensHint: "Hover the diagram to inspect it with the lens.",
      manifesto:
        "Write to be read. Build to last. Every byte in service of reading, every page rendered before the network can even blink.",
    },
    notFound: {
      crash: "SEGMENTATION FAULT",
      dump: [
        "signal 11: SIGSEGV (invalid memory access)",
        "  at 0x00000404 route_resolve()",
        "  at 0x1F4C0DE render_page()",
        "core dumped :: the requested page does not exist",
      ],
      reboot: "Reboot to home",
    },
    post: {
      catPrefix: "operator@lisible:~$ cat",
      tocTitle: "INDEX",
      eof: "EOF :: end of transmission",
    },
  },
  a11y: {
    skipToContent: "Skip to main content",
    toggleTheme: "Toggle theme",
    openSearch: "Open search (Ctrl+K)",
    closeSearch: "Close search",
    backToTop: "Back to top",
    languageSwitcher: "Language selection",
    frenchVersion: "Version française",
    englishVersion: "English version",
  },
};

export const ui: Record<Locale, Dict> = { fr, en };

export function t(locale: Locale): Dict {
  return ui[locale];
}

export function ensureTrailingSlash(path: string): string {
  if (path.endsWith("/")) return path;
  const last = path.split("/").pop() ?? "";
  if (last.includes(".")) return path;
  return `${path}/`;
}

export function localeUrl(locale: Locale, path = ""): string {
  return ensureTrailingSlash(withPreviewLocaleBase(locale, path, getRelativeLocaleUrl(locale, path)));
}
