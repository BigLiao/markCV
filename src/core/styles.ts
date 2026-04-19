import fs from "node:fs/promises";
import path from "node:path";

import { BUILTIN_THEMES_DIR, DEFAULT_THEME } from "../constants.js";
import type { ResolvedTheme } from "../types.js";

type ThemeStyleName = "screen.css" | "print.css";

function getDefaultThemeStylePath(styleName: ThemeStyleName): string {
  return path.join(BUILTIN_THEMES_DIR, DEFAULT_THEME, styleName);
}

function isBuiltinDefaultTheme(theme: ResolvedTheme): boolean {
  return theme.source === "builtin" && theme.name === DEFAULT_THEME;
}

async function getThemeStyle(
  theme: ResolvedTheme,
  styleName: ThemeStyleName,
  themeStylePath: string | undefined
): Promise<string> {
  const baseCss = await fs.readFile(getDefaultThemeStylePath(styleName), "utf8");

  if (!themeStylePath || isBuiltinDefaultTheme(theme)) {
    return baseCss;
  }

  const themeCss = await fs.readFile(themeStylePath, "utf8");
  return `${baseCss}\n\n${themeCss}`;
}

export function getScreenCss(theme: ResolvedTheme): Promise<string> {
  return getThemeStyle(theme, "screen.css", theme.screenCssPath);
}

export function getPrintCss(theme: ResolvedTheme): Promise<string> {
  return getThemeStyle(theme, "print.css", theme.printCssPath);
}
