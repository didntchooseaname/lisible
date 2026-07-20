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
  callouts: {
    note: "Note",
    tip: "Astuce",
    warning: "Attention",
    caution: "Prudence",
    important: "Important",
  },
  diagram: {
    label: "Diagramme",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser la vue",
    copy: "Copier la source",
    copied: "Copié",
    loading: "Rendu du diagramme…",
    hint: "Molette pour zoomer · glisser pour déplacer",
    renderError: "Échec du rendu du diagramme",
  },
  drawio: {
    label: "Diagramme draw.io",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser la vue",
  },
  lightbox: {
    close: "Fermer",
    prev: "Image précédente",
    next: "Image suivante",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser le zoom",
  },
  mdx: {
    tabList: "Onglets",
    spoilerShow: "Afficher",
    spoilerHide: "Masquer",
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
    statsTitle: "En chiffres",
    statPosts: "articles publiés",
    statTags: "tags",
    statLanguages: "langues",
    statMinutes: "minutes de lecture",
    stackTitle: "La stack",
    stackAria: "Technologies utilisées sur ce blog",
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
    description: "Tous les articles publiés, regroupés par année et par mois.",
    empty: "Aucun article pour le moment.",
  },
  pagination: {
    label: "Pagination",
    prev: "Précédent",
    next: "Suivant",
    page: (n: number, total: number) => `Page ${n} sur ${total}`,
  },
  series: {
    label: "Série",
    part: (n: number, total: number) => `Partie ${n} sur ${total}`,
    prev: "Épisode précédent",
    next: "Épisode suivant",
    toc: "Tous les épisodes de la série",
    totalTime: (min: number) => `${min} min de lecture au total`,
    count: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
    intro: "Cet article fait partie d'une série.",
  },
  ai: {
    label: "Ouvrir dans une IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Markdown copié",
    openClaude: "Ouvrir dans Claude",
    openChatgpt: "Ouvrir dans ChatGPT",
    prompt: (title: string) =>
      `Lis cet article et aide-moi à le comprendre en profondeur : « ${title} ».`,
  },
  share: {
    label: "Partager cet article",
    twitter: "Partager sur X",
    bluesky: "Partager sur Bluesky",
    linkedin: "Partager sur LinkedIn",
    mastodon: "Partager sur Mastodon",
    copyLink: "Copier le lien",
    copied: "Lien copié",
    mastodonPrompt:
      "Entrez le domaine de votre instance Mastodon (ex. mastodon.social) :",
  },
  comments: {
    title: "Commentaires",
    blueskyReply: "Répondre sur Bluesky",
    blueskyLoading: "Chargement de la discussion...",
    blueskyEmpty: "Aucune réponse pour l'instant. Lancez la discussion sur Bluesky.",
  },
  webmentions: {
    title: "Mentions du web",
    likes: (n: number) => (n === 1 ? "1 like" : `${n} likes`),
    reposts: (n: number) => (n === 1 ? "1 partage" : `${n} partages`),
    empty: "Aucune mention pour le moment.",
  },
  palette: {
    searchSection: "Articles",
    actionsSection: "Actions",
    navSection: "Aller à",
    hint: "Flèches pour naviguer, Entrée pour valider, Échap pour fermer.",
    toggleTheme: "Basculer le thème clair / sombre",
    switchLanguage: "Changer de langue",
    resetAccent: "Réinitialiser la couleur d'accent",
    copyUrl: "Copier l'URL de la page",
    urlCopied: "URL copiée",
    goHome: "Accueil",
    goBlog: "Blog",
    goTags: "Tags",
    goArchives: "Archives",
    goAbout: "À propos",
    openRss: "Ouvrir le flux RSS",
  },
  code: {
    copy: "Copier le code",
    copied: "Copié",
    terminal: "Terminal",
    collapsedLines: "{lineCount} {lineCount;1=ligne masquée;lignes masquées}",
  },
  githubCard: {
    stars: "étoiles",
    forks: "forks",
    loading: "Chargement des informations du dépôt...",
    viewOnGithub: (repo: string) => `Voir le dépôt ${repo} sur GitHub`,
  },
  accent: {
    open: "Personnaliser la couleur d'accent",
    svLabel: "Saturation et luminosité",
    hueLabel: "Teinte",
    svValueText: "Saturation {s} %, luminosité {v} %",
    hueValueText: "Teinte {h}°",
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
    copyHeadingLink: "Copier le lien vers cette section",
    headingLinkCopied: "Lien copié",
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
    related: "Read next",
    editOnGithub: "Edit this page on GitHub",
  },
  callouts: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
  diagram: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    copy: "Copy source",
    copied: "Copied",
    loading: "Rendering diagram…",
    hint: "Scroll to zoom · drag to pan",
    renderError: "Failed to render diagram",
  },
  drawio: {
    label: "draw.io diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
  },
  lightbox: {
    close: "Close",
    prev: "Previous image",
    next: "Next image",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset zoom",
  },
  mdx: {
    tabList: "Tabs",
    spoilerShow: "Show",
    spoilerHide: "Hide",
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
    statsTitle: "In numbers",
    statPosts: "published posts",
    statTags: "tags",
    statLanguages: "languages",
    statMinutes: "minutes of reading",
    stackTitle: "The stack",
    stackAria: "Technologies used on this blog",
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
    description: "Every published post, grouped by year and month.",
    empty: "No posts yet.",
  },
  pagination: {
    label: "Pagination",
    prev: "Previous",
    next: "Next",
    page: (n: number, total: number) => `Page ${n} of ${total}`,
  },
  series: {
    label: "Series",
    part: (n: number, total: number) => `Part ${n} of ${total}`,
    prev: "Previous episode",
    next: "Next episode",
    toc: "All episodes in this series",
    totalTime: (min: number) => `${min} min read in total`,
    count: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
    intro: "This post is part of a series.",
  },
  ai: {
    label: "Open in an AI",
    copyMarkdown: "Copy as Markdown",
    copied: "Markdown copied",
    openClaude: "Open in Claude",
    openChatgpt: "Open in ChatGPT",
    prompt: (title: string) =>
      `Read this article and help me understand it in depth: "${title}".`,
  },
  share: {
    label: "Share this post",
    twitter: "Share on X",
    bluesky: "Share on Bluesky",
    linkedin: "Share on LinkedIn",
    mastodon: "Share on Mastodon",
    copyLink: "Copy link",
    copied: "Link copied",
    mastodonPrompt:
      "Enter your Mastodon instance domain (e.g. mastodon.social):",
  },
  comments: {
    title: "Comments",
    blueskyReply: "Reply on Bluesky",
    blueskyLoading: "Loading the discussion...",
    blueskyEmpty: "No replies yet. Start the discussion on Bluesky.",
  },
  webmentions: {
    title: "Webmentions",
    likes: (n: number) => (n === 1 ? "1 like" : `${n} likes`),
    reposts: (n: number) => (n === 1 ? "1 repost" : `${n} reposts`),
    empty: "No mentions yet.",
  },
  palette: {
    searchSection: "Posts",
    actionsSection: "Actions",
    navSection: "Go to",
    hint: "Arrows to move, Enter to run, Esc to close.",
    toggleTheme: "Toggle light / dark theme",
    switchLanguage: "Switch language",
    resetAccent: "Reset accent color",
    copyUrl: "Copy page URL",
    urlCopied: "URL copied",
    goHome: "Home",
    goBlog: "Blog",
    goTags: "Tags",
    goArchives: "Archives",
    goAbout: "About",
    openRss: "Open the RSS feed",
  },
  code: {
    copy: "Copy code",
    copied: "Copied",
    terminal: "Terminal",
    collapsedLines: "{lineCount} collapsed {lineCount;1=line;lines}",
  },
  githubCard: {
    stars: "stars",
    forks: "forks",
    loading: "Loading repository information...",
    viewOnGithub: (repo: string) => `View the ${repo} repository on GitHub`,
  },
  accent: {
    open: "Customize the accent color",
    svLabel: "Saturation and brightness",
    hueLabel: "Hue",
    svValueText: "Saturation {s}%, brightness {v}%",
    hueValueText: "Hue {h}°",
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
    openMenu: "Open menu",
    copyHeadingLink: "Copy link to this section",
    headingLinkCopied: "Link copied",
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
  const clean = path.replace(/^\/+/, "");
  return ensureTrailingSlash(withPreviewLocaleBase(locale, path, `${prefix}/${clean}` || "/"));
}
