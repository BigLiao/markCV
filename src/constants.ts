import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APP_NAME = "markcv";
export const APP_VERSION = "2.0.0-alpha.0";
export const DEFAULT_INPUT = "resume.md";
export const DEFAULT_THEME = "default";
export const DEFAULT_LANG = "zh-CN";
export const DEFAULT_TITLE = "Resume";
export const DEFAULT_DEV_PORT = 4173;

export function getPackageRoot(): string {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      throw new Error("Failed to locate MarkCV package root.");
    }

    currentDir = parentDir;
  }
}

export const BUILTIN_THEMES_DIR = path.join(getPackageRoot(), "themes");
