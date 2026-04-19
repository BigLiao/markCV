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
  const screenCssPath = path.join(themeDirectory, "screen.css");
  const printCssPath = path.join(themeDirectory, "print.css");

  if (!(await fileExists(screenCssPath))) {
    throw new Error(`Missing theme stylesheet: ${screenCssPath}`);
  }

  if (!(await fileExists(printCssPath))) {
    throw new Error(`Missing theme print stylesheet: ${printCssPath}`);
  }

  const assetsDirectory = path.join(themeDirectory, "assets");

  return {
    ...meta,
    directory: themeDirectory,
    screenCssPath,
    printCssPath,
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
  const screenCss = await fs.readFile(theme.screenCssPath, "utf8");
  const printCss = await fs.readFile(theme.printCssPath, "utf8");

  if (!/@page\s*\{[^}]*size\s*:\s*A4/i.test(printCss)) {
    issues.push("print.css must include an A4 @page size rule.");
  }

  for (const selector of [".mcv-page", ".mcv-header", ".mcv-content"]) {
    if (!screenCss.includes(selector)) {
      issues.push(`screen.css should style ${selector}.`);
    }
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
    path.join(themeDirectory, "screen.css"),
    `.mcv {\n  --mcv-accent: #0f4c81;\n}\n\n.mcv-page {\n  max-width: 210mm;\n  min-height: 297mm;\n  margin: 24px auto;\n  padding: 16mm;\n  background: #ffffff;\n}\n\n.mcv-header {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 20px;\n}\n\n.mcv-content {\n  margin-top: 24px;\n}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(themeDirectory, "print.css"),
    `@page {\n  size: A4;\n  margin: 0;\n}\n\n.mcv-page {\n  margin: 0;\n  box-shadow: none;\n}\n`,
    "utf8"
  );

  return themeDirectory;
}
