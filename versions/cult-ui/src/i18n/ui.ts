import { getRelativeLocaleUrl } from "astro:i18n";
import { withPreviewLocaleBase } from "../../../../shared/preview/url";
import { codeTexts } from "./code";

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
    eyebrow: "Blog technique, bilingue et statique",
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
  series: {
    label: "Série",
    part: (n: number, total: number) => `Partie ${n} sur ${total}`,
    inThisSeries: "Dans cette série",
    viewAll: "Voir la série complète",
    description: (name: string) =>
      `Tous les articles de la série « ${name} », dans l'ordre de lecture.`,
    cumulativeTime: (min: number) => `${min} min de lecture au total`,
    postsCount: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
    current: "Vous êtes ici",
  },
  archives: {
    title: "Archives",
    description:
      "Tous les articles, du plus récent au plus ancien, groupés par année puis par mois.",
    empty: "Aucun article pour le moment.",
    postsCount: (n: number) => (n === 1 ? "1 article" : `${n} articles`),
  },
  paginate: {
    label: "Pagination",
    prev: "Précédent",
    next: "Suivant",
    pageOf: (current: number, total: number) => `Page ${current} sur ${total}`,
  },
  share: {
    title: "Partager cet article",
    x: "Partager sur X",
    bluesky: "Partager sur Bluesky",
    linkedin: "Partager sur LinkedIn",
    mastodon: "Partager sur Mastodon",
    copyLink: "Copier le lien",
    copied: "Lien copié",
    mastodonPrompt: "Votre instance Mastodon (ex. mastodon.social)",
  },
  ai: {
    label: "Actions pour l'IA",
    menuTitle: "Ouvrir avec une IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Markdown copié",
    openInClaude: "Ouvrir dans Claude",
    openInChatGPT: "Ouvrir dans ChatGPT",
    viewMarkdown: "Voir la version Markdown",
  },
  palette: {
    placeholder: "Rechercher ou lancer une commande...",
    sectionResults: "Articles",
    sectionActions: "Actions",
    sectionNav: "Aller à",
    hint: "Tapez pour rechercher, ou choisissez une action.",
    noResults: "Aucun résultat.",
    actionToggleTheme: "Basculer le thème clair / sombre",
    actionSwitchLang: "Passer en anglais (English)",
    actionResetAccent: "Réinitialiser la couleur d'accent",
    actionCopyUrl: "Copier l'URL de la page",
    actionCopied: "Copié dans le presse-papiers",
    navHome: "Accueil",
    navBlog: "Blog",
    navTags: "Tags",
    navArchives: "Archives",
    navAbout: "À propos",
    openRss: "Ouvrir le flux RSS",
  },
  webmentions: {
    title: "Réactions du web",
    likes: (n: number) => (n === 1 ? "1 j'aime" : `${n} j'aime`),
    reposts: (n: number) => (n === 1 ? "1 partage" : `${n} partages`),
    mentions: "Mentions",
    empty: "Aucune réaction pour l'instant.",
  },
  comments: {
    title: "Commentaires",
    loading: "Chargement des commentaires...",
    blueskyPrompt: "Répondez sur Bluesky, votre message apparaîtra ici.",
    blueskyView: "Voir la discussion sur Bluesky",
  },
  lightbox: {
    label: "Visionneuse d'images",
    close: "Fermer la visionneuse",
    prev: "Image précédente",
    next: "Image suivante",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    reset: "Réinitialiser le zoom",
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
    statsPosts: "articles publiés",
    statsTags: "tags",
    statsLanguages: "langues",
    stackTitle: "Sous le capot",
    stackDescription: "Le socle technique du blog, en deux commandes.",
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
    successTitle: "Merci !",
    successMessage: "Inscription enregistrée. À bientôt dans votre boîte mail.",
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
    copy: codeTexts.fr.copy,
    copied: codeTexts.fr.copied,
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
  github: {
    stars: "étoiles",
    forks: "forks",
    language: "langage",
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
    openToc: "Ouvrir le sommaire",
    closeToc: "Fermer le sommaire",
    openActions: "Ouvrir les actions de l'article",
    closeActions: "Fermer les actions de l'article",
    copyLink: "Copier le lien de l'article",
    linkCopied: "Lien copié",
    shareOnX: "Partager sur X",
    closeNewsletter: "Fermer le formulaire d'abonnement",
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
    eyebrow: "A technical, bilingual, static blog",
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
  series: {
    label: "Series",
    part: (n: number, total: number) => `Part ${n} of ${total}`,
    inThisSeries: "In this series",
    viewAll: "View the full series",
    description: (name: string) =>
      `All the posts in the "${name}" series, in reading order.`,
    cumulativeTime: (min: number) => `${min} min read in total`,
    postsCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
    current: "You are here",
  },
  archives: {
    title: "Archives",
    description:
      "Every post, from newest to oldest, grouped by year then by month.",
    empty: "No posts yet.",
    postsCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
  },
  paginate: {
    label: "Pagination",
    prev: "Previous",
    next: "Next",
    pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
  },
  share: {
    title: "Share this post",
    x: "Share on X",
    bluesky: "Share on Bluesky",
    linkedin: "Share on LinkedIn",
    mastodon: "Share on Mastodon",
    copyLink: "Copy link",
    copied: "Link copied",
    mastodonPrompt: "Your Mastodon instance (e.g. mastodon.social)",
  },
  ai: {
    label: "AI actions",
    menuTitle: "Open with AI",
    copyMarkdown: "Copy as Markdown",
    copied: "Markdown copied",
    openInClaude: "Open in Claude",
    openInChatGPT: "Open in ChatGPT",
    viewMarkdown: "View the Markdown version",
  },
  palette: {
    placeholder: "Search or run a command...",
    sectionResults: "Posts",
    sectionActions: "Actions",
    sectionNav: "Go to",
    hint: "Type to search, or pick an action.",
    noResults: "No results.",
    actionToggleTheme: "Toggle light / dark theme",
    actionSwitchLang: "Passer en français (French)",
    actionResetAccent: "Reset the accent color",
    actionCopyUrl: "Copy the page URL",
    actionCopied: "Copied to clipboard",
    navHome: "Home",
    navBlog: "Blog",
    navTags: "Tags",
    navArchives: "Archives",
    navAbout: "About",
    openRss: "Open the RSS feed",
  },
  webmentions: {
    title: "Around the web",
    likes: (n: number) => (n === 1 ? "1 like" : `${n} likes`),
    reposts: (n: number) => (n === 1 ? "1 repost" : `${n} reposts`),
    mentions: "Mentions",
    empty: "No reactions yet.",
  },
  comments: {
    title: "Comments",
    loading: "Loading comments...",
    blueskyPrompt: "Reply on Bluesky and your message will show up here.",
    blueskyView: "View the discussion on Bluesky",
  },
  lightbox: {
    label: "Image viewer",
    close: "Close viewer",
    prev: "Previous image",
    next: "Next image",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset zoom",
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
    statsPosts: "published posts",
    statsTags: "tags",
    statsLanguages: "languages",
    stackTitle: "Under the hood",
    stackDescription: "The technical foundation of the blog, in two commands.",
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
    successTitle: "Thank you!",
    successMessage: "Signup recorded. See you in your inbox soon.",
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
    copy: codeTexts.en.copy,
    copied: codeTexts.en.copied,
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
  github: {
    stars: "stars",
    forks: "forks",
    language: "language",
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
    openToc: "Open the table of contents",
    closeToc: "Close the table of contents",
    openActions: "Open post actions",
    closeActions: "Close post actions",
    copyLink: "Copy the post link",
    linkCopied: "Link copied",
    shareOnX: "Share on X",
    closeNewsletter: "Close the subscribe form",
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
