import fs from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { BUILTIN_THEMES_DIR, DEFAULT_THEME } from "../constants.js";
import type { ResolvedTheme, ThemeCheckResult, ThemeMeta } from "../types.js";
import { looksLikePath } from "../utils/paths.js";

const themeMetaSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  version: z.string().min(1).optional(),
  author: z.string().min(1).optional()
});

async function loadThemeMeta(themeDirectory: string): Promise<ThemeMeta> {
  const jsonPath = path.join(themeDirectory, "theme.json");
  const raw = await fs.readFile(jsonPath, "utf8");
  return themeMetaSchema.parse(JSON.parse(raw));
}

async function directoryExists(directoryPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(directoryPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function resolveTheme(themeInput?: string): Promise<ResolvedTheme> {
  const source: "builtin" | "local" = themeInput && looksLikePath(themeInput) ? "local" : "builtin";
  const themeDirectory =
    source === "local"
      ? path.resolve(themeInput || DEFAULT_THEME)
      : path.join(BUILTIN_THEMES_DIR, themeInput || DEFAULT_THEME);

  if (!(await directoryExists(themeDirectory))) {
    throw new Error(`Theme directory not found: ${themeDirectory}`);
  }

  const meta = await loadThemeMeta(themeDirectory);
  const templatePath = path.join(themeDirectory, "template.njk");
  const screenCssPath = path.join(themeDirectory, "screen.css");
  const printCssPath = path.join(themeDirectory, "print.css");
  const hasScreenCss = await fileExists(screenCssPath);
  const hasPrintCss = await fileExists(printCssPath);

  if (!(await fileExists(templatePath))) {
    throw new Error(`Missing theme template: ${templatePath}`);
  }

  const assetsDirectory = path.join(themeDirectory, "assets");

  return {
    ...meta,
    directory: themeDirectory,
    templatePath,
    screenCssPath: hasScreenCss ? screenCssPath : undefined,
    printCssPath: hasPrintCss ? printCssPath : undefined,
    assetsDirectory: (await directoryExists(assetsDirectory)) ? assetsDirectory : undefined,
    source
  };
}

export async function listBuiltinThemes(): Promise<ResolvedTheme[]> {
  const entries = await fs.readdir(BUILTIN_THEMES_DIR, { withFileTypes: true });
  const themes = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => resolveTheme(entry.name))
  );

  return themes.sort((left, right) => left.name.localeCompare(right.name));
}

export async function checkTheme(themeInput: string): Promise<ThemeCheckResult> {
  const theme = await resolveTheme(themeInput);
  const issues: string[] = [];
  const template = await fs.readFile(theme.templatePath, "utf8");

  if (!/\{\{\s*contentHtml(?:\s*\|\s*safe)?\s*\}\}/.test(template)) {
    issues.push("template.njk must render contentHtml.");
  }

  return {
    themePath: theme.directory,
    ok: issues.length === 0,
    issues
  };
}

export async function createThemeScaffold(themeName: string, targetDirectory: string): Promise<string> {
  const themeDirectory = path.resolve(targetDirectory);
  const metadata = {
    name: themeName,
    label: themeName,
    version: "0.1.0",
    author: "you"
  };

  await fs.mkdir(path.join(themeDirectory, "assets"), { recursive: true });
  await fs.writeFile(path.join(themeDirectory, "theme.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(themeDirectory, "template.njk"),
    `<!doctype html>
<html lang="{{ document.lang }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ document.title }}</title>
    <link rel="stylesheet" href="{{ helpers.themeAsset('screen.css') }}" media="screen" />
    <link rel="stylesheet" href="{{ helpers.themeAsset('print.css') }}" media="print" />
  </head>
  <body class="mcv theme-{{ theme.name }}">
    <main class="mcv-page">
      <header class="mcv-header">
        <div class="mcv-header-main">
          {% if basics and basics.name %}
          <h1 class="mcv-name">{{ basics.name }}</h1>
          {% endif %}
          {% if basics and basics.headline %}
          <p class="mcv-headline">{{ basics.headline }}</p>
          {% endif %}
          {% if basics and basics.summary %}
          <p class="mcv-summary">{{ basics.summary }}</p>
          {% endif %}
        </div>
        {% if basics and basics.avatar %}
        <div class="mcv-header-avatar">
          <img src="{{ helpers.asset(basics.avatar) }}" alt="{{ basics.name or 'Avatar' }}" />
        </div>
        {% endif %}
      </header>

      <article class="mcv-content markdown-body">
        {{ contentHtml | safe }}
      </article>
    </main>
  </body>
</html>
`,
    "utf8"
  );

  return themeDirectory;
}
