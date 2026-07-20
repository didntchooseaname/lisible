import { getRelativeLocaleUrl } from "astro:i18n";
import { withPreviewLocaleBase } from "../../../../shared/preview/url";
import { cardStrings } from "./cards";

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
    certifications: "Certifications",
    friends: "Amis",
    main: "Navigation principale",
  },
  home: {
    metaTitle: "Lisible, le framework de blog pensé pour la lecture",
    featured: "À la une",
    latest: "Derniers articles",
    allPosts: "Tous les articles",
    recentCards: "À lire maintenant",
    knowledgeGraphKicker: "Carte vivante des connaissances",
    knowledgeGraphTitle: "Knowledge graph",
    knowledgeGraphHint:
      "Les articles de démonstration se regroupent par séries et thématiques. Explorez un groupe, survolez un nœud pour révéler ses connexions, déplacez-le ou ouvrez l'article.",
    knowledgeGraphOverview: "Vue d'ensemble du knowledge graph",
    knowledgeGraphArticles: "articles",
    knowledgeGraphGroups: "groupes",
    knowledgeGraphLinks: "connexions",
    knowledgeGraphFilters: "Filtrer les groupes",
    knowledgeGraphReset: "Vue globale",
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
    anchorCopied: "Lien copié",
    spoilerReveal: "Afficher le contenu masqué",
  },
  lightbox: {
    title: "Visionneuse d'images",
    close: "Fermer la visionneuse",
    prev: "Image précédente",
    next: "Image suivante",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    reset: "Réinitialiser le zoom",
    counter: "Image {current} sur {total}",
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
    series: "Séries",
  },
  pagination: {
    label: "Pagination",
    prev: "Précédent",
    next: "Suivant",
    pageOf: (current: number, total: number) => `Page ${current} sur ${total}`,
  },
  archives: {
    title: "Archives",
    description:
      "Tous les articles publiés, groupés par année puis par mois, du plus récent au plus ancien.",
    postsCount: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
  },
  series: {
    label: "Série",
    partOf: (order: number, total: number) => `Partie ${order} sur ${total}`,
    inThisSeries: "Dans cette série",
    viewAll: "Voir la série complète",
    prev: "Article précédent de la série",
    next: "Article suivant de la série",
    cumulativeTime: (min: number) => `${min} min de lecture au total`,
    listTitle: "Séries",
    listDescription: "Les articles regroupés en séries, à lire dans l'ordre.",
    description: (slug: string) =>
      `Tous les articles de la série « ${slug} », dans l'ordre de lecture.`,
    articlesCount: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
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
    title: "Utiliser avec une IA",
    open: "Ouvrir le menu IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Copié",
    viewMarkdown: "Voir la version Markdown",
    openClaude: "Ouvrir dans Claude",
    openChatgpt: "Ouvrir dans ChatGPT",
    prompt: "Lis cet article et aide-moi à le comprendre",
  },
  palette: {
    placeholder: "Rechercher ou taper une commande...",
    searchGroup: "Recherche",
    actionsGroup: "Actions",
    navGroup: "Aller à",
    hint: "Tapez pour rechercher, ou choisissez une action ci-dessous.",
    empty: "Aucun résultat.",
    toggleTheme: "Basculer le thème",
    switchLanguage: "Changer de langue",
    resetAccent: "Réinitialiser l'accent",
    copyUrl: "Copier l'URL de la page",
    urlCopied: "URL copiée",
    goBlog: "Blog",
    goTags: "Tags",
    goArchives: "Archives",
    goAbout: "À propos",
    openRss: "Ouvrir le flux RSS",
  },
  comments: {
    title: "Commentaires",
    blueskyVia: "Répondez sur Bluesky pour commenter cet article.",
    blueskyOpen: "Voir la discussion sur Bluesky",
  },
  webmentions: {
    title: "Réactions du web",
    likes: "J'aime",
    reposts: "Partages",
    mentions: "Mentions",
    empty: "Aucune réaction pour le moment.",
  },
  accent: {
    open: "Choisir la couleur d'accent",
    title: "Couleur d'accent",
    svLabel: "Saturation et luminosité",
    hueLabel: "Teinte",
    svValueText: "Saturation {s}%, luminosité {v}%",
    hueValueText: "Teinte {h}°",
    reset: "Réinitialiser",
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
    about: "About",
    archives: "Archives",
    series: "Series",
    certifications: "Certifications",
    friends: "Friends",
    main: "Main navigation",
  },
  home: {
    metaTitle: "Lisible, the blog framework built for reading",
    featured: "Featured",
    latest: "Latest posts",
    allPosts: "All posts",
    recentCards: "Read now",
    knowledgeGraphKicker: "Living knowledge map",
    knowledgeGraphTitle: "Knowledge graph",
    knowledgeGraphHint:
      "Demo posts gather into series and topics. Explore a group, hover a node to reveal its connections, drag it or open the article.",
    knowledgeGraphOverview: "Knowledge graph overview",
    knowledgeGraphArticles: "articles",
    knowledgeGraphGroups: "groups",
    knowledgeGraphLinks: "connections",
    knowledgeGraphFilters: "Filter groups",
    knowledgeGraphReset: "Global view",
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
    anchorCopied: "Link copied",
    spoilerReveal: "Reveal hidden content",
  },
  lightbox: {
    title: "Image viewer",
    close: "Close viewer",
    prev: "Previous image",
    next: "Next image",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset zoom",
    counter: "Image {current} of {total}",
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
    series: "Series",
  },
  pagination: {
    label: "Pagination",
    prev: "Previous",
    next: "Next",
    pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
  },
  archives: {
    title: "Archives",
    description:
      "All published posts, grouped by year then month, from newest to oldest.",
    postsCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
  },
  series: {
    label: "Series",
    partOf: (order: number, total: number) => `Part ${order} of ${total}`,
    inThisSeries: "In this series",
    viewAll: "View the full series",
    prev: "Previous post in the series",
    next: "Next post in the series",
    cumulativeTime: (min: number) => `${min} min read in total`,
    listTitle: "Series",
    listDescription: "Posts grouped into series, meant to be read in order.",
    description: (slug: string) =>
      `All the posts in the "${slug}" series, in reading order.`,
    articlesCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
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
    title: "Use with an AI",
    open: "Open AI menu",
    copyMarkdown: "Copy as Markdown",
    copied: "Copied",
    viewMarkdown: "View the Markdown version",
    openClaude: "Open in Claude",
    openChatgpt: "Open in ChatGPT",
    prompt: "Read this article and help me understand it",
  },
  palette: {
    placeholder: "Search or type a command...",
    searchGroup: "Search",
    actionsGroup: "Actions",
    navGroup: "Go to",
    hint: "Type to search, or pick an action below.",
    empty: "No results.",
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch language",
    resetAccent: "Reset accent",
    copyUrl: "Copy page URL",
    urlCopied: "URL copied",
    goBlog: "Blog",
    goTags: "Tags",
    goArchives: "Archives",
    goAbout: "About",
    openRss: "Open RSS feed",
  },
  comments: {
    title: "Comments",
    blueskyVia: "Reply on Bluesky to comment on this post.",
    blueskyOpen: "View the discussion on Bluesky",
  },
  webmentions: {
    title: "Reactions from the web",
    likes: "Likes",
    reposts: "Reposts",
    mentions: "Mentions",
    empty: "No reactions yet.",
  },
  accent: {
    open: "Choose accent color",
    title: "Accent color",
    svLabel: "Saturation and brightness",
    hueLabel: "Hue",
    svValueText: "Saturation {s}%, brightness {v}%",
    hueValueText: "Hue {h}°",
    reset: "Reset",
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
  return ensureTrailingSlash(withPreviewLocaleBase(locale, path, getRelativeLocaleUrl(locale, path)));
}
