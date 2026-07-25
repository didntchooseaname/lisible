import { describe, expect, it } from "bun:test";
import {
  formatDate,
  formatMonth,
  githubEditUrl,
  isoDate,
  readingTime,
  truncate,
} from "../../shared/lib/format";

// Dates passed to Intl formatters are built with the local-time constructor so
// the expected day never shifts with the machine timezone. isoDate is UTC
// based, so its test uses Date.UTC instead.

describe("readingTime", () => {
  it("returns at least one minute, even for empty text", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("   \n\t  ")).toBe(1);
    expect(readingTime("quelques mots seulement")).toBe(1);
  });

  it("counts 200 words per minute", () => {
    expect(readingTime("mot ".repeat(400))).toBe(2);
    expect(readingTime("mot ".repeat(850))).toBe(4);
  });

  it("splits on any whitespace run", () => {
    expect(readingTime("un\ndeux\t trois    quatre")).toBe(1);
  });
});

describe("formatDate", () => {
  const date = new Date(2026, 2, 10);

  it("formats long French dates", () => {
    expect(formatDate(date, "fr")).toBe("10 mars 2026");
  });

  it("formats long English dates", () => {
    expect(formatDate(date, "en")).toBe("March 10, 2026");
  });

  it("formats short dates with abbreviated months", () => {
    const january = new Date(2026, 0, 15);
    expect(formatDate(january, "fr", "short")).toBe("15 janv. 2026");
    expect(formatDate(january, "en", "short")).toBe("Jan 15, 2026");
  });

  it("defaults to the long style", () => {
    expect(formatDate(date, "fr")).toBe(formatDate(date, "fr", "long"));
  });
});

describe("formatMonth", () => {
  it("accepts a month index and capitalises French names", () => {
    expect(formatMonth(0, "fr")).toBe("Janvier");
    expect(formatMonth(11, "fr")).toBe("Décembre");
  });

  it("accepts a Date", () => {
    expect(formatMonth(new Date(2026, 6, 1), "en")).toBe("July");
    expect(formatMonth(new Date(2026, 3, 1), "fr")).toBe("Avril");
  });
});

describe("isoDate", () => {
  it("returns the UTC calendar date", () => {
    expect(isoDate(new Date(Date.UTC(2026, 2, 10, 12, 34, 56)))).toBe("2026-03-10");
  });

  it("pads month and day", () => {
    expect(isoDate(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });
});

describe("truncate", () => {
  it("leaves short text untouched", () => {
    expect(truncate("court", 10)).toBe("court");
    expect(truncate("pile poil", 9)).toBe("pile poil");
  });

  it("cuts on a word boundary when one is close to the limit", () => {
    expect(truncate("aaaa bbbb cccc dddd", 12)).toBe("aaaa bbbb…");
  });

  it("hard cuts when no word boundary is close enough", () => {
    expect(truncate("abcdefghijklmnop", 10)).toBe("abcdefghij…");
  });
});

describe("githubEditUrl", () => {
  const repo = {
    url: "https://github.com/user/repo/",
    branch: "main",
    contentBase: "shared/content/blog",
  };

  it("returns null when no repo url is configured", () => {
    expect(githubEditUrl({ ...repo, url: "" }, "fr/bienvenue.mdx")).toBeNull();
  });

  it("prefixes relative paths with the content base", () => {
    expect(githubEditUrl(repo, "fr/bienvenue.mdx")).toBe(
      "https://github.com/user/repo/edit/main/shared/content/blog/fr/bienvenue.mdx",
    );
  });

  it("skips the content base for absolute paths", () => {
    expect(githubEditUrl(repo, "/README.md")).toBe(
      "https://github.com/user/repo/edit/main/README.md",
    );
  });

  it("normalises stray slashes", () => {
    const messy = { url: "https://github.com/user/repo//", branch: "main", contentBase: "/docs/" };
    expect(githubEditUrl(messy, "guide.md")).toBe(
      "https://github.com/user/repo/edit/main/docs/guide.md",
    );
  });
});
