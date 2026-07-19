import { getRelativeLocaleUrl } from "astro:i18n";
import { cardStrings } from "./cards";
import { codeStrings } from "./code";

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
    archives: "Archives",
    series: "Séries",
    about: "À propos",
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
    related: "À lire ensuite",
    editOnGithub: "Modifier cette page sur GitHub",
  },
  reader: {
    anchorLabel: "Copier le lien vers cette section",
    anchorCopied: "Lien copié",
    spoilerLabel: "Contenu masqué, cliquez pour révéler",
    diagram: "Diagramme",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    zoomReset: "Réinitialiser la vue",
    copySource: "Copier la source",
    copied: "Copié",
    diagramError: "Échec du rendu du diagramme",
    lightboxLabel: "Visionneuse d'images",
    close: "Fermer",
    prevImage: "Image précédente",
    nextImage: "Image suivante",
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
    archives: "Archives",
  },
  archives: {
    title: "Archives",
    description: "Tous les articles du blog, du plus récent au plus ancien, groupés par année et par mois.",
    count: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
  },
  pagination: {
    label: "Pagination",
    prev: "Précédent",
    next: "Suivant",
    page: (current: number, total: number) => `Page ${current} sur ${total}`,
  },
  series: {
    label: "Série",
    listTitle: "Séries",
    listDescription: "Tous les parcours éditoriaux, regroupés dans leur ordre de lecture.",
    empty: "Aucune série publiée pour le moment.",
    part: (order: number, total: number) => `Partie ${order} sur ${total}`,
    prev: "Précédent dans la série",
    next: "Suivant dans la série",
    listLabel: "Tous les articles de la série",
    viewAll: "Voir la série complète",
    cumulative: (min: number) => `${min} min de lecture au total`,
    current: "Vous lisez cet article",
    description: (title: string) => `Tous les articles de la série « ${title} », dans l'ordre de lecture.`,
  },
  share: {
    title: "Partager cet article",
    onX: "Partager sur X",
    onBluesky: "Partager sur Bluesky",
    onLinkedin: "Partager sur LinkedIn",
    onMastodon: "Partager sur Mastodon",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    mastodonPrompt: "Entrez le domaine de votre instance Mastodon (ex. mastodon.social)",
  },
  ai: {
    title: "Utiliser avec une IA",
    open: "Ouvrir le menu des actions IA",
    copyMarkdown: "Copier en Markdown",
    markdownCopied: "Markdown copié",
    viewMarkdown: "Voir la version Markdown",
    openInClaude: "Ouvrir dans Claude",
    openInChatGPT: "Ouvrir dans ChatGPT",
    prompt: (url: string) => `Lis cet article et aide-moi à le comprendre : ${url}`,
  },
  palette: {
    title: "Palette de commandes",
    actionsGroup: "Actions",
    resultsGroup: "Articles",
    toggleTheme: "Basculer le thème",
    switchLanguage: "Passer en anglais",
    resetAccent: "Réinitialiser la couleur d'accent",
    copyUrl: "Copier l'URL de la page",
    urlCopied: "URL copiée",
    goBlog: "Aller au blog",
    goTags: "Aller aux tags",
    goArchives: "Aller aux archives",
    goAbout: "Aller à la page À propos",
    openRss: "Ouvrir le flux RSS",
  },
  webmentions: {
    title: "Réactions du web",
    likes: (n: number) => (n === 1 ? "1 j'aime" : `${n} j'aime`),
    reposts: (n: number) => (n === 1 ? "1 partage" : `${n} partages`),
    mentions: "Mentions",
    empty: "Aucune réaction pour le moment.",
  },
  comments: {
    title: "Commentaires",
  },
  code: codeStrings.fr,
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
    archives: "Archives",
    series: "Series",
    about: "About",
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
    related: "Read next",
    editOnGithub: "Edit this page on GitHub",
  },
  reader: {
    anchorLabel: "Copy link to this section",
    anchorCopied: "Link copied",
    spoilerLabel: "Hidden content, click to reveal",
    diagram: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomReset: "Reset view",
    copySource: "Copy source",
    copied: "Copied",
    diagramError: "Failed to render diagram",
    lightboxLabel: "Image viewer",
    close: "Close",
    prevImage: "Previous image",
    nextImage: "Next image",
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
    archives: "Archives",
  },
  archives: {
    title: "Archives",
    description: "Every post on this blog, from newest to oldest, grouped by year and month.",
    count: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
  },
  pagination: {
    label: "Pagination",
    prev: "Previous",
    next: "Next",
    page: (current: number, total: number) => `Page ${current} of ${total}`,
  },
  series: {
    label: "Series",
    listTitle: "Series",
    listDescription: "Every editorial path, grouped in reading order.",
    empty: "No series have been published yet.",
    part: (order: number, total: number) => `Part ${order} of ${total}`,
    prev: "Previous in series",
    next: "Next in series",
    listLabel: "All posts in this series",
    viewAll: "View the full series",
    cumulative: (min: number) => `${min} min read in total`,
    current: "You are reading this post",
    description: (title: string) => `All posts in the "${title}" series, in reading order.`,
  },
  share: {
    title: "Share this post",
    onX: "Share on X",
    onBluesky: "Share on Bluesky",
    onLinkedin: "Share on LinkedIn",
    onMastodon: "Share on Mastodon",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    mastodonPrompt: "Enter your Mastodon instance domain (e.g. mastodon.social)",
  },
  ai: {
    title: "Use with an AI",
    open: "Open AI actions menu",
    copyMarkdown: "Copy as Markdown",
    markdownCopied: "Markdown copied",
    viewMarkdown: "View the Markdown version",
    openInClaude: "Open in Claude",
    openInChatGPT: "Open in ChatGPT",
    prompt: (url: string) => `Read this article and help me understand it: ${url}`,
  },
  palette: {
    title: "Command palette",
    actionsGroup: "Actions",
    resultsGroup: "Posts",
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch to French",
    resetAccent: "Reset accent color",
    copyUrl: "Copy page URL",
    urlCopied: "URL copied",
    goBlog: "Go to blog",
    goTags: "Go to tags",
    goArchives: "Go to archives",
    goAbout: "Go to about page",
    openRss: "Open RSS feed",
  },
  webmentions: {
    title: "Reactions from the web",
    likes: (n: number) => (n === 1 ? "1 like" : `${n} likes`),
    reposts: (n: number) => (n === 1 ? "1 repost" : `${n} reposts`),
    mentions: "Mentions",
    empty: "No reactions yet.",
  },
  comments: {
    title: "Comments",
  },
  code: codeStrings.en,
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
  const url = getRelativeLocaleUrl(locale, path);
  const lastSegment = path.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return url.replace(/\/$/, "");
  return ensureTrailingSlash(url);
}
