# lisible

Scaffold a [Lisible](https://github.com/didntchooseaname/lisible) blog: a minimal, fast, reading-first blog framework for Astro, with six visual variants over one shared core, French and English out of the box.

## Usage

```bash
bunx lisible my-blog
```

Or non-interactively:

```bash
bunx lisible my-blog --yes --variant organique --title "My blog"
```

The `npm create` convention works too, through the `create-lisible` companion package:

```bash
bun create lisible my-blog
```

Requires [git](https://git-scm.com) and [Bun](https://bun.sh). The command downloads the template without its history, initializes a fresh repository, and runs the guided setup (variant, title, URL, author, accent color).

## License

MIT
