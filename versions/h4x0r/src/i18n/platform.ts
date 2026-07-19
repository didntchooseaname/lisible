
export interface PlatformStrings {
  share: {
    title: string;
    x: string;
    bluesky: string;
    linkedin: string;
    mastodon: string;
    mastodonPrompt: string;
    copyLink: string;
    copied: string;
  };
  ai: {
    label: string;
    copyMarkdown: string;
    copied: string;
    copyFailed: string;
    openClaude: string;
    openChatgpt: string;
    prompt: (url: string) => string;
  };
  palette: {
    actions: string;
    navigation: string;
    results: string;
    toggleTheme: string;
    switchLang: string;
    resetAccent: string;
    copyUrl: string;
    copiedUrl: string;
    goBlog: string;
    goTags: string;
    goArchives: string;
    goAbout: string;
    openRss: string;
  };
  archives: {
    title: string;
    description: string;
    postsCount: (n: number) => string;
  };
  series: {
    label: string;
    part: (current: number, total: number) => string;
    pageTitle: (name: string) => string;
    pageDescription: (name: string) => string;
    totalReadingTime: (min: number) => string;
    episodes: string;
    prev: string;
    next: string;
    current: string;
  };
  pager: {
    page: (current: number, total: number) => string;
    prev: string;
    next: string;
    label: string;
  };
  webmentions: {
    title: string;
    likes: (n: number) => string;
    reposts: (n: number) => string;
    mentions: string;
    empty: string;
  };
  comments: {
    title: string;
    loading: string;
    error: string;
    joinBluesky: string;
  };
  rssView: {
    aboutTitle: string;
    aboutText: string;
    visitSite: string;
    published: string;
    itemsTitle: string;
  };
}

const fr: PlatformStrings = {
  share: {
    title: "Partager cette transmission",
    x: "Partager sur X",
    bluesky: "Partager sur Bluesky",
    linkedin: "Partager sur LinkedIn",
    mastodon: "Partager sur Mastodon",
    mastodonPrompt:
      "Adresse de votre instance Mastodon (ex: mastodon.social). Elle sera memorisee sur cet appareil.",
    copyLink: "Copier le lien",
    copied: "Lien copié",
  },
  ai: {
    label: "Assistants IA",
    copyMarkdown: "Copier en Markdown",
    copied: "Markdown copié",
    copyFailed: "Copie impossible",
    openClaude: "Ouvrir dans Claude",
    openChatgpt: "Ouvrir dans ChatGPT",
    prompt: (url) => `Lis cet article et réponds à mes questions: ${url}`,
  },
  palette: {
    actions: "Actions",
    navigation: "Navigation",
    results: "Résultats",
    toggleTheme: "Basculer le thème",
    switchLang: "Switch to English",
    resetAccent: "Réinitialiser la couleur d'accent",
    copyUrl: "Copier l'URL de la page",
    copiedUrl: "URL copiée",
    goBlog: "Aller au blog",
    goTags: "Aller aux tags",
    goArchives: "Aller aux archives",
    goAbout: "Aller à la page à propos",
    openRss: "Ouvrir le flux RSS",
  },
  archives: {
    title: "Archives",
    description:
      "Toutes les transmissions consignées, année par année, mois par mois.",
    postsCount: (n) => (n === 1 ? "1 article" : `${n} articles`),
  },
  series: {
    label: "Série",
    part: (current, total) => `Partie ${current} sur ${total}`,
    pageTitle: (name) => `Série: ${name}`,
    pageDescription: (name) =>
      `Tous les épisodes de la série « ${name} », dans l'ordre de lecture.`,
    totalReadingTime: (min) => `${min} min de lecture cumulées`,
    episodes: "Épisodes de la série",
    prev: "Épisode précédent",
    next: "Épisode suivant",
    current: "Vous êtes ici",
  },
  pager: {
    page: (current, total) => `Page ${current} sur ${total}`,
    prev: "Page précédente",
    next: "Page suivante",
    label: "Pagination",
  },
  webmentions: {
    title: "Webmentions",
    likes: (n) => (n === 1 ? "1 j'aime" : `${n} j'aime`),
    reposts: (n) => (n === 1 ? "1 partage" : `${n} partages`),
    mentions: "Mentions",
    empty: "Aucune mention pour le moment.",
  },
  comments: {
    title: "Commentaires",
    loading: "Chargement des commentaires...",
    error: "Impossible de charger les commentaires.",
    joinBluesky: "Répondre sur Bluesky",
  },
  rssView: {
    aboutTitle: "Ceci est un flux RSS",
    aboutText:
      "Copiez l'adresse de cette page dans votre lecteur RSS pour recevoir les nouveaux articles automatiquement. RSS est un format ouvert: pas de compte, pas d'algorithme, juste les articles.",
    visitSite: "Visiter le site",
    published: "Publié le",
    itemsTitle: "Derniers articles",
  },
};

const en: PlatformStrings = {
  share: {
    title: "Share this transmission",
    x: "Share on X",
    bluesky: "Share on Bluesky",
    linkedin: "Share on LinkedIn",
    mastodon: "Share on Mastodon",
    mastodonPrompt:
      "Your Mastodon instance address (e.g. mastodon.social). It will be remembered on this device.",
    copyLink: "Copy link",
    copied: "Link copied",
  },
  ai: {
    label: "AI assistants",
    copyMarkdown: "Copy as Markdown",
    copied: "Markdown copied",
    copyFailed: "Copy failed",
    openClaude: "Open in Claude",
    openChatgpt: "Open in ChatGPT",
    prompt: (url) => `Read this article and answer my questions about it: ${url}`,
  },
  palette: {
    actions: "Actions",
    navigation: "Navigation",
    results: "Results",
    toggleTheme: "Toggle theme",
    switchLang: "Passer en français",
    resetAccent: "Reset accent color",
    copyUrl: "Copy page URL",
    copiedUrl: "URL copied",
    goBlog: "Go to blog",
    goTags: "Go to tags",
    goArchives: "Go to archives",
    goAbout: "Go to about page",
    openRss: "Open RSS feed",
  },
  archives: {
    title: "Archives",
    description: "Every logged transmission, year by year, month by month.",
    postsCount: (n) => (n === 1 ? "1 post" : `${n} posts`),
  },
  series: {
    label: "Series",
    part: (current, total) => `Part ${current} of ${total}`,
    pageTitle: (name) => `Series: ${name}`,
    pageDescription: (name) =>
      `All episodes of the "${name}" series, in reading order.`,
    totalReadingTime: (min) => `${min} min total reading time`,
    episodes: "Episodes in this series",
    prev: "Previous episode",
    next: "Next episode",
    current: "You are here",
  },
  pager: {
    page: (current, total) => `Page ${current} of ${total}`,
    prev: "Previous page",
    next: "Next page",
    label: "Pagination",
  },
  webmentions: {
    title: "Webmentions",
    likes: (n) => (n === 1 ? "1 like" : `${n} likes`),
    reposts: (n) => (n === 1 ? "1 repost" : `${n} reposts`),
    mentions: "Mentions",
    empty: "No mentions yet.",
  },
  comments: {
    title: "Comments",
    loading: "Loading comments...",
    error: "Comments could not be loaded.",
    joinBluesky: "Reply on Bluesky",
  },
  rssView: {
    aboutTitle: "This is an RSS feed",
    aboutText:
      "Copy this page's address into your RSS reader to get new posts automatically. RSS is an open format: no account, no algorithm, just the posts.",
    visitSite: "Visit the website",
    published: "Published on",
    itemsTitle: "Latest posts",
  },
};

export const platformStrings = { fr, en } as const;
