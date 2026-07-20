import { getRelativeLocaleUrl } from "astro:i18n";
import { withPreviewLocaleBase } from "../../../../shared/preview/url";
import { codeUi } from "./code";

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
    topicsPrefix: "En ce moment:",
    topics: ["performance", "accessibilité", "typographie", "outillage"],
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
    explore: "Explorer par tag",
    viewTagPage: "Voir la page du tag",
  },
  about: {
    title: "À propos",
    description: "Qui écrit ici, et pourquoi ce blog existe.",
    paragraphs: [
      "Bonjour, je suis l'auteur de ce blog. J'écris ici sur le web moderne: la performance, l'accessibilité, le design d'interfaces et l'outillage qui rend tout cela agréable.",
      "Ce blog est aussi une démonstration technique: généré avec Astro, entièrement statique, navigable sans rechargement de page, bilingue et sombre par défaut. Le code privilégie la sobriété: peu de JavaScript, une typographie soignée et des pages qui se chargent vite.",
      "Vous pouvez explorer les articles par tags, utiliser la recherche plein texte (Ctrl+K) ou vous abonner au flux RSS pour suivre les nouveautés.",
    ],
    role: "Auteur du blog",
    githubPreviewAlt: "Aperçu du profil GitHub",
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
    placeholders: [
      "vous@exemple.fr",
      "prenom.nom@exemple.fr",
      "Recevoir les nouveaux articles",
    ],
    button: "S'abonner",
    submit: "Envoyer l'adresse email",
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
  code: codeUi.fr,
  callout: {
    note: "Note",
    tip: "Astuce",
    warning: "Avertissement",
    caution: "Attention",
    important: "Important",
    toggle: "Afficher ou masquer le contenu",
  },
  reading: {
    related: "À lire ensuite",
    editOnGithub: "Modifier cette page sur GitHub",
    coverAltFallback: "Image de couverture de l'article",
  },
  pagination: {
    nav: "Pagination",
    previous: "Page précédente",
    next: "Page suivante",
    pageLabel: (current: number, total: number) => `Page ${current} sur ${total}`,
    pageTitle: (base: string, current: number, total: number) =>
      `${base} · Page ${current} sur ${total}`,
  },
  archives: {
    title: "Archives",
    description: "Tous les articles publiés, regroupés par année et par mois.",
    empty: "Aucun article pour le moment.",
  },
  series: {
    label: "Série",
    partOf: (title: string) => `Cet article fait partie de la série « ${title} ».`,
    position: (current: number, total: number) => `Partie ${current} sur ${total}`,
    previous: "Précédent dans la série",
    next: "Suivant dans la série",
    showList: "Voir tous les articles de la série",
    viewSeries: "Voir la série",
    cumulativeTime: (min: number) => `${min} min de lecture au total`,
    indexDescription: (title: string) =>
      `Tous les articles de la série « ${title} », dans l'ordre de lecture.`,
    current: "Vous lisez cet article",
  },
  share: {
    label: "Partager",
    x: "Partager sur X",
    bluesky: "Partager sur Bluesky",
    linkedin: "Partager sur LinkedIn",
    mastodon: "Partager sur Mastodon",
    copyLink: "Copier le lien",
    copied: "Lien copié",
    mastodonPrompt: "Votre instance Mastodon (ex : mastodon.social)",
  },
  ai: {
    label: "Pour l'IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Copié",
    viewMarkdown: "Voir la version Markdown",
    openClaude: "Ouvrir dans Claude",
    openChatGpt: "Ouvrir dans ChatGPT",
    promptPrefix: "Lis et résume cet article : ",
  },
  palette: {
    placeholder: "Rechercher un article ou lancer une action…",
    searchOnly: "Rechercher un article…",
    actionsHeading: "Actions",
    resultsHeading: "Articles",
    navHeading: "Aller à",
    hint: "Tapez pour rechercher, ou choisissez une action.",
    copied: "Copié",
    actions: {
      toggleTheme: "Basculer le thème clair / sombre",
      switchLanguage: "Changer de langue",
      resetAccent: "Réinitialiser la couleur d'accent",
      copyUrl: "Copier l'URL de la page",
      openRss: "Ouvrir le flux RSS",
      goHome: "Accueil",
      goBlog: "Blog",
      goTags: "Tags",
      goArchives: "Archives",
      goAbout: "À propos",
    },
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
  },
  lightbox: {
    close: "Fermer la visionneuse",
    previous: "Image précédente",
    next: "Image suivante",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser le zoom",
  },
  anchor: {
    copyLink: "Copier le lien vers cette section",
    copied: "Lien copié",
  },
  diagram: {
    label: "Diagramme",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser la vue",
    copy: "Copier la source",
    copied: "Copié",
    error: "Échec du rendu du diagramme",
    hint: "Molette pour zoomer · Glisser pour déplacer",
  },
  spoiler: {
    show: "Afficher le contenu masqué",
    label: "Contenu masqué",
  },
  githubCard: {
    stars: "étoiles",
    forks: "forks",
    language: "langage principal",
  },
  accent: {
    open: "Choisir la couleur d'accent",
    title: "Couleur d'accent",
    saturation: "Saturation et luminosité",
    saturationValue: "Saturation {s} %, luminosité {v} %",
    hue: "Teinte",
    hueValue: "Teinte {h}°",
    reset: "Réinitialiser",
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
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    openSocial: "Afficher les liens sociaux",
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
    topicsPrefix: "Currently exploring:",
    topics: ["performance", "accessibility", "typography", "tooling"],
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
    explore: "Browse by tag",
    viewTagPage: "View the tag page",
  },
  about: {
    title: "About",
    description: "Who writes here, and why this blog exists.",
    paragraphs: [
      "Hi, I am the author of this blog. I write here about the modern web: performance, accessibility, interface design and the tooling that makes it all enjoyable.",
      "This blog is also a technical showcase: built with Astro, fully static, navigable without any page reload, bilingual and dark by default. The code favors restraint: little JavaScript, careful typography and pages that load fast.",
      "You can browse posts by tags, use the full text search (Ctrl+K) or subscribe to the RSS feed to follow new posts.",
    ],
    role: "Blog author",
    githubPreviewAlt: "Preview of the GitHub profile",
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
    placeholders: [
      "you@example.com",
      "first.last@example.com",
      "Get new posts by email",
    ],
    button: "Subscribe",
    submit: "Submit email address",
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
  code: codeUi.en,
  callout: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
    toggle: "Show or hide the content",
  },
  reading: {
    related: "Read next",
    editOnGithub: "Edit this page on GitHub",
    coverAltFallback: "Article cover image",
  },
  pagination: {
    nav: "Pagination",
    previous: "Previous page",
    next: "Next page",
    pageLabel: (current: number, total: number) => `Page ${current} of ${total}`,
    pageTitle: (base: string, current: number, total: number) =>
      `${base} · Page ${current} of ${total}`,
  },
  archives: {
    title: "Archives",
    description: "Every published post, grouped by year and month.",
    empty: "No posts yet.",
  },
  series: {
    label: "Series",
    partOf: (title: string) => `This article is part of the "${title}" series.`,
    position: (current: number, total: number) => `Part ${current} of ${total}`,
    previous: "Previous in series",
    next: "Next in series",
    showList: "Show all articles in the series",
    viewSeries: "View the series",
    cumulativeTime: (min: number) => `${min} min read in total`,
    indexDescription: (title: string) =>
      `Every article in the "${title}" series, in reading order.`,
    current: "You are reading this article",
  },
  share: {
    label: "Share",
    x: "Share on X",
    bluesky: "Share on Bluesky",
    linkedin: "Share on LinkedIn",
    mastodon: "Share on Mastodon",
    copyLink: "Copy link",
    copied: "Link copied",
    mastodonPrompt: "Your Mastodon instance (e.g. mastodon.social)",
  },
  ai: {
    label: "For AI",
    copyMarkdown: "Copy as Markdown",
    copied: "Copied",
    viewMarkdown: "View the Markdown version",
    openClaude: "Open in Claude",
    openChatGpt: "Open in ChatGPT",
    promptPrefix: "Read and summarize this article: ",
  },
  palette: {
    placeholder: "Search a post or run a command…",
    searchOnly: "Search a post…",
    actionsHeading: "Actions",
    resultsHeading: "Articles",
    navHeading: "Go to",
    hint: "Type to search, or pick an action.",
    copied: "Copied",
    actions: {
      toggleTheme: "Toggle light / dark theme",
      switchLanguage: "Switch language",
      resetAccent: "Reset accent color",
      copyUrl: "Copy page URL",
      openRss: "Open the RSS feed",
      goHome: "Home",
      goBlog: "Blog",
      goTags: "Tags",
      goArchives: "Archives",
      goAbout: "About",
    },
  },
  webmentions: {
    title: "Reactions from the web",
    likes: "Likes",
    reposts: "Reposts",
    mentions: "Mentions",
    empty: "No reactions yet.",
  },
  comments: {
    title: "Comments",
  },
  lightbox: {
    close: "Close the viewer",
    previous: "Previous image",
    next: "Next image",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset zoom",
  },
  anchor: {
    copyLink: "Copy link to this section",
    copied: "Link copied",
  },
  diagram: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    copy: "Copy source",
    copied: "Copied",
    error: "Failed to render the diagram",
    hint: "Scroll to zoom · Drag to pan",
  },
  spoiler: {
    show: "Reveal the hidden content",
    label: "Hidden content",
  },
  githubCard: {
    stars: "stars",
    forks: "forks",
    language: "main language",
  },
  accent: {
    open: "Choose the accent color",
    title: "Accent color",
    saturation: "Saturation and brightness",
    saturationValue: "Saturation {s}%, brightness {v}%",
    hue: "Hue",
    hueValue: "Hue {h}°",
    reset: "Reset",
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
    openMenu: "Open the menu",
    closeMenu: "Close the menu",
    openSocial: "Show social links",
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
