import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import fs from "fs-extra";
import matter from "gray-matter";
import { buildResume } from "../src/core/build.js";

const cwd = process.cwd();
const examplesDir = path.join(cwd, "examples");
const themesDir = path.join(cwd, "themes");
const outputDir = path.join(cwd, "site");

type SitePage = {
  exampleLabel: string;
  exampleSource: string;
  title: string;
  themeLabel: string;
  themeName: string;
  url: string;
};

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugifySegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "example";
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  if (!(await fs.pathExists(directory))) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMarkdownFiles(resolvedPath);
      }

      return entry.isFile() && entry.name.endsWith(".md") ? [resolvedPath] : [];
    })
  );

  return results.flat().sort((left, right) => left.localeCompare(right));
}

async function collectBuiltInThemes(): Promise<Array<{ name: string; label: string }>> {
  const entries = await readdir(themesDir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const raw = await readFile(path.join(themesDir, entry.name, "theme.json"), "utf8");
        const metadata = JSON.parse(raw) as { label?: string };

        return {
          name: entry.name,
          label: metadata.label || entry.name
        };
      })
  );
}

async function collectExamples(): Promise<
  Array<{ slug: string; label: string; inputPath: string; source: string; title: string }>
> {
  const inputPaths = await findMarkdownFiles(examplesDir);

  return Promise.all(
    inputPaths.map(async (inputPath) => {
      const raw = await readFile(inputPath, "utf8");
      const parsed = matter(raw);
      const frontmatter = parsed.data as {
        title?: string;
        basics?: { name?: string };
      };
      const relativeDirectory = path.relative(examplesDir, path.dirname(inputPath));
      const relativeInputPath = toPosixPath(path.relative(cwd, inputPath));

      return {
        slug:
          !relativeDirectory || relativeDirectory === "."
            ? slugifySegment(path.basename(inputPath, path.extname(inputPath)))
            : toPosixPath(relativeDirectory)
                .split("/")
                .map(slugifySegment)
                .join("/"),
        label: toPosixPath(relativeDirectory || path.basename(inputPath)),
        inputPath,
        source: relativeInputPath,
        title: frontmatter.title || frontmatter.basics?.name || relativeInputPath
      };
    })
  );
}

function renderIndexHtml(pages: SitePage[]): string {
  const groupedPages = new Map<string, SitePage[]>();

  for (const page of pages) {
    const existing = groupedPages.get(page.exampleLabel) || [];
    existing.push(page);
    groupedPages.set(page.exampleLabel, existing);
  }

  const sections = [...groupedPages.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, examplePages]) => {
      const firstPage = examplePages[0];
      const cards = [...examplePages]
        .sort((left, right) => left.themeName.localeCompare(right.themeName))
        .map(
          (page) => `<a class="theme-card" href="${escapeHtml(page.url)}">
              <span class="theme-card__label">${escapeHtml(page.themeLabel)}</span>
              <span class="theme-card__meta">${escapeHtml(page.themeName)}</span>
            </a>`
        )
        .join("\n");

      return `<section class="example-section">
          <div class="example-section__header">
            <div>
              <p class="eyebrow">Example</p>
              <h2>${escapeHtml(firstPage.title)}</h2>
            </div>
            <code>${escapeHtml(firstPage.exampleSource)}</code>
          </div>
          <div class="theme-grid">
            ${cards}
          </div>
        </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MarkCV Theme Gallery</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f2eee6;
        --panel: rgba(255, 252, 247, 0.86);
        --panel-strong: rgba(255, 252, 247, 0.96);
        --border: rgba(56, 43, 30, 0.14);
        --text: #2c2117;
        --muted: #6f5a46;
        --accent: #0f766e;
        --accent-strong: #134e4a;
        --shadow: 0 20px 60px rgba(58, 42, 21, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
      }

      body {
        color: var(--text);
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top right, rgba(15, 118, 110, 0.18), transparent 28%),
          radial-gradient(circle at left 20%, rgba(217, 119, 6, 0.12), transparent 24%),
          linear-gradient(180deg, #fcfbf7 0%, var(--bg) 100%);
      }

      main {
        width: min(1080px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 72px;
      }

      .hero {
        margin-bottom: 28px;
        padding: 32px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: var(--panel-strong);
        box-shadow: var(--shadow);
      }

      .hero h1 {
        margin: 0;
        font-size: clamp(2.4rem, 4vw, 4rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .hero p {
        max-width: 62ch;
        margin: 14px 0 0;
        color: var(--muted);
        font-size: 1.04rem;
        line-height: 1.7;
      }

      .hero-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
      }

      .hero-stats span {
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.72);
        font-size: 0.92rem;
      }

      .example-section {
        margin-top: 18px;
        padding: 24px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--panel);
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
      }

      .example-section__header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 18px;
      }

      .example-section__header h2 {
        margin: 4px 0 0;
        font-size: 1.6rem;
        line-height: 1.15;
      }

      .eyebrow {
        margin: 0;
        color: var(--accent-strong);
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      code {
        display: inline-block;
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(44, 33, 23, 0.06);
        color: var(--muted);
        font-family: "SFMono-Regular", "JetBrains Mono", monospace;
        font-size: 0.88rem;
      }

      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
      }

      .theme-card {
        display: block;
        padding: 18px;
        border: 1px solid rgba(15, 118, 110, 0.16);
        border-radius: 20px;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.84);
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          box-shadow 160ms ease;
      }

      .theme-card:hover {
        transform: translateY(-2px);
        border-color: rgba(15, 118, 110, 0.4);
        box-shadow: 0 18px 32px rgba(15, 118, 110, 0.12);
      }

      .theme-card__label,
      .theme-card__meta {
        display: block;
      }

      .theme-card__label {
        font-size: 1rem;
        font-weight: 700;
      }

      .theme-card__meta {
        margin-top: 6px;
        color: var(--muted);
        font-size: 0.88rem;
      }

      @media (max-width: 720px) {
        main {
          width: min(100% - 20px, 1080px);
          padding-top: 24px;
          padding-bottom: 40px;
        }

        .hero,
        .example-section {
          padding: 20px;
          border-radius: 20px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>MarkCV Theme Gallery</h1>
        <p>Static previews generated from every <code>examples/**/*.md</code> file across all built-in themes. Each card opens a fully self-contained HTML artifact that can be published directly to GitHub Pages.</p>
        <div class="hero-stats">
          <span>${pages.length} HTML builds</span>
          <span>${groupedPages.size} example set${groupedPages.size === 1 ? "" : "s"}</span>
        </div>
      </section>
      ${sections}
    </main>
  </body>
</html>
`;
}

async function buildPage(inputPath: string, themeName: string, targetDirectory: string, title: string): Promise<void> {
  await buildResume({
    cwd,
    input: inputPath,
    output: targetDirectory,
    theme: themeName,
    title
  });
}

async function main() {
  const [themes, examples] = await Promise.all([collectBuiltInThemes(), collectExamples()]);

  if (examples.length === 0) {
    throw new Error(`No example markdown files found under ${examplesDir}.`);
  }

  await fs.remove(outputDir);
  await fs.ensureDir(outputDir);

  const pages: SitePage[] = [];

  for (const example of examples) {
    for (const theme of themes) {
      const targetDirectory = path.join(outputDir, "examples", example.slug, theme.name);
      const title = `${example.title} · ${theme.label} · MarkCV`;
      await buildPage(example.inputPath, theme.name, targetDirectory, title);

      pages.push({
        exampleLabel: example.label,
        exampleSource: example.source,
        title: example.title,
        themeLabel: theme.label,
        themeName: theme.name,
        url: toPosixPath(path.relative(outputDir, path.join(targetDirectory, "index.html")))
      });
    }
  }

  await fs.writeFile(path.join(outputDir, "index.html"), renderIndexHtml(pages), "utf8");
  console.log(`Built GitHub Pages site: ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
