import { withPreviewLocaleBase } from "../../../../shared/preview/url";

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
    heroPrefix: "Notes sur",
    heroWords: ["le web moderne", "la performance", "l'accessibilité", "la typographie"],
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
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    related: "À lire ensuite",
    editOnGithub: "Modifier cette page sur GitHub",
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
    stats: {
      title: "Le blog en chiffres",
      posts: "Articles publiés",
      tags: "Tags",
      languages: "Langues",
    },
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
    done: "Merci !",
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
  code: {
    copy: "Copier le code",
    copied: "Copié",
    collapsedLines: "{lineCount} lignes repliées",
  },
  accent: {
    picker: "Personnaliser la couleur d'accent",
    title: "Couleur d'accent",
    area: "Saturation et luminosité",
    areaValue: "Saturation {s} %, luminosité {v} %",
    hue: "Teinte",
    hueValue: "Teinte {deg}°",
    reset: "Réinitialiser",
  },
  github: {
    stars: "étoiles",
    forks: "forks",
    language: "langage",
    repoCard: (repo: string) => `Dépôt GitHub ${repo}`,
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
    zoomImage: "Agrandir l'image",
    closeDialog: "Fermer",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    resetZoom: "Réinitialiser le zoom",
    prevImage: "Image précédente",
    nextImage: "Image suivante",
    imageCounter: (current: number, total: number) => `Image ${current} sur ${total}`,
    headingAnchor: "Lien vers cette section",
    headingCopied: "Lien copié",
  },
  callouts: {
    note: "Note",
    tip: "Astuce",
    warning: "Attention",
    caution: "Prudence",
    important: "Important",
  },
  mermaid: {
    label: "Diagramme",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    reset: "Réinitialiser la vue",
    copy: "Copier la source",
    copied: "Copié",
    loading: "Rendu du diagramme…",
    error: "Échec du rendu du diagramme",
    hint: "Molette pour zoomer · Glisser pour déplacer",
  },
  drawio: {
    label: "Schéma",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    reset: "Réinitialiser la vue",
    hint: "Molette pour zoomer · Glisser pour déplacer",
  },
  mdx: {
    spoilerShow: "Afficher",
    spoilerHide: "Masquer",
    spoilerLabel: "Contenu masqué",
    tabsLabel: "Onglets",
  },
  share: {
    title: "Partager",
    x: "Partager sur X",
    bluesky: "Partager sur Bluesky",
    linkedin: "Partager sur LinkedIn",
    mastodon: "Partager sur Mastodon",
    copyLink: "Copier le lien",
    copied: "Lien copié",
    mastodonPrompt: "Votre instance Mastodon (ex: mastodon.social)",
  },
  ai: {
    trigger: "Actions IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Copié",
    openClaude: "Ouvrir dans Claude",
    openChatgpt: "Ouvrir dans ChatGPT",
    prompt: (url: string) => `Lis et résume cet article: ${url}`,
  },
  pagination: {
    nav: "Pagination",
    prev: "Précédent",
    next: "Suivant",
    page: (current: number, total: number) => `Page ${current} sur ${total}`,
  },
  archives: {
    title: "Archives",
    description: "Tous les articles, du plus récent au plus ancien, groupés par année et par mois.",
    count: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
  },
  series: {
    label: "Série",
    partOf: (name: string) => `Cet article fait partie de la série « ${name} »`,
    position: (current: number, total: number) => `Partie ${current} sur ${total}`,
    prev: "Épisode précédent",
    next: "Épisode suivant",
    viewAll: "Voir toute la série",
    toggleList: "Afficher les épisodes de la série",
    cumulativeTime: (min: number) => `${min} min de lecture au total`,
    description: (name: string) => `Tous les articles de la série « ${name} », dans l'ordre de lecture.`,
  },
  palette: {
    placeholder: "Rechercher ou exécuter une commande...",
    searchSection: "Articles",
    actionsSection: "Actions",
    navSection: "Aller à",
    noResults: "Aucun résultat.",
    hint: "Tapez pour rechercher, ↑ ↓ pour naviguer, Entrée pour valider.",
    toggleTheme: "Basculer le thème clair / sombre",
    changeLang: "Changer de langue",
    resetAccent: "Réinitialiser la couleur d'accent",
    copyUrl: "Copier l'URL de la page",
    copiedUrl: "URL copiée",
    openRss: "Ouvrir le flux RSS",
    goBlog: "Aller au blog",
    goTags: "Aller aux tags",
    goArchives: "Aller aux archives",
    goAbout: "Aller à la page à propos",
  },
  webmentions: {
    title: "Réactions du web",
    likes: "J'aime",
    reposts: "Partages",
    mentions: "Mentions",
    empty: "Aucune réaction pour le moment.",
  },
  comments: {
    title: "Commentaires",
    loading: "Chargement des commentaires…",
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
    heroPrefix: "Notes on",
    heroWords: ["the modern web", "performance", "accessibility", "typography"],
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
    copyLink: "Copy link",
    linkCopied: "Link copied",
    related: "Read next",
    editOnGithub: "Edit this page on GitHub",
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
    stats: {
      title: "The blog in numbers",
      posts: "Published posts",
      tags: "Tags",
      languages: "Languages",
    },
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
    done: "Thanks!",
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
  code: {
    copy: "Copy code",
    copied: "Copied",
    collapsedLines: "{lineCount} collapsed lines",
  },
  accent: {
    picker: "Customize accent color",
    title: "Accent color",
    area: "Saturation and brightness",
    areaValue: "Saturation {s}%, brightness {v}%",
    hue: "Hue",
    hueValue: "Hue {deg}°",
    reset: "Reset",
  },
  github: {
    stars: "stars",
    forks: "forks",
    language: "language",
    repoCard: (repo: string) => `GitHub repository ${repo}`,
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
    zoomImage: "Zoom image",
    closeDialog: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    prevImage: "Previous image",
    nextImage: "Next image",
    imageCounter: (current: number, total: number) => `Image ${current} of ${total}`,
    headingAnchor: "Link to this section",
    headingCopied: "Link copied",
  },
  callouts: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
  mermaid: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    copy: "Copy source",
    copied: "Copied",
    loading: "Rendering diagram…",
    error: "Failed to render diagram",
    hint: "Scroll to zoom · Drag to pan",
  },
  drawio: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    hint: "Scroll to zoom · Drag to pan",
  },
  mdx: {
    spoilerShow: "Show",
    spoilerHide: "Hide",
    spoilerLabel: "Hidden content",
    tabsLabel: "Tabs",
  },
  share: {
    title: "Share",
    x: "Share on X",
    bluesky: "Share on Bluesky",
    linkedin: "Share on LinkedIn",
    mastodon: "Share on Mastodon",
    copyLink: "Copy link",
    copied: "Link copied",
    mastodonPrompt: "Your Mastodon instance (e.g. mastodon.social)",
  },
  ai: {
    trigger: "AI actions",
    copyMarkdown: "Copy as Markdown",
    copied: "Copied",
    openClaude: "Open in Claude",
    openChatgpt: "Open in ChatGPT",
    prompt: (url: string) => `Read and summarize this article: ${url}`,
  },
  pagination: {
    nav: "Pagination",
    prev: "Previous",
    next: "Next",
    page: (current: number, total: number) => `Page ${current} of ${total}`,
  },
  archives: {
    title: "Archives",
    description: "Every post, newest to oldest, grouped by year and month.",
    count: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
  },
  series: {
    label: "Series",
    partOf: (name: string) => `This post is part of the "${name}" series`,
    position: (current: number, total: number) => `Part ${current} of ${total}`,
    prev: "Previous episode",
    next: "Next episode",
    viewAll: "View the whole series",
    toggleList: "Show the episodes in this series",
    cumulativeTime: (min: number) => `${min} min read in total`,
    description: (name: string) => `All the posts in the "${name}" series, in reading order.`,
  },
  palette: {
    placeholder: "Search or run a command...",
    searchSection: "Posts",
    actionsSection: "Actions",
    navSection: "Go to",
    noResults: "No results.",
    hint: "Type to search, ↑ ↓ to move, Enter to run.",
    toggleTheme: "Toggle light / dark theme",
    changeLang: "Switch language",
    resetAccent: "Reset accent color",
    copyUrl: "Copy page URL",
    copiedUrl: "URL copied",
    openRss: "Open RSS feed",
    goBlog: "Go to the blog",
    goTags: "Go to tags",
    goArchives: "Go to archives",
    goAbout: "Go to the about page",
  },
  webmentions: {
    title: "Web reactions",
    likes: "Likes",
    reposts: "Reposts",
    mentions: "Mentions",
    empty: "No reactions yet.",
  },
  comments: {
    title: "Comments",
    loading: "Loading comments…",
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
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const cleanPath = path.replace(/^\/+/, "");
  const joined = `${prefix}/${cleanPath}`.replace(/\/{2,}/g, "/");
  return ensureTrailingSlash(withPreviewLocaleBase(locale, path, joined));
}
