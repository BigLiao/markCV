import path from "node:path";

import fs from "fs-extra";

import { DEFAULT_INPUT } from "../constants.js";
import type { BuildResult, CommonCommandOptions } from "../types.js";
import { AssetManager } from "./assets.js";
import { loadResume } from "./frontmatter.js";
import { renderMarkdown } from "./markdown.js";
import { renderDocument } from "./render.js";
import { resolveTheme } from "./theme.js";

type ResolvedOutput = {
  outputDirectory: string;
  htmlFilename: string;
};

function resolveInputPath(cwd: string, input?: string): string {
  return path.resolve(cwd, input || DEFAULT_INPUT);
}

function resolveOutput(cwd: string, output?: string): ResolvedOutput {
  if (!output) {
    return {
      outputDirectory: path.resolve(cwd, "dist"),
      htmlFilename: "index.html"
    };
  }

  const absoluteOutput = path.resolve(cwd, output);

  if (absoluteOutput.endsWith(".html")) {
    return {
      outputDirectory: path.dirname(absoluteOutput),
      htmlFilename: path.basename(absoluteOutput)
    };
  }

  return {
    outputDirectory: absoluteOutput,
    htmlFilename: "index.html"
  };
}

function resolveThemeAssetBuildUrl(reference: string): string {
  if (reference === "screen.css" || reference === "print.css") {
    return `./assets/theme/${reference}`;
  }

  if (reference.startsWith("assets/")) {
    return `./assets/theme/${reference}`;
  }

  throw new Error(`Unsupported theme asset reference: ${reference}`);
}

async function copyThemeAssets(themeDirectory: string, outputDirectory: string): Promise<void> {
  await fs.ensureDir(path.join(outputDirectory, "assets", "theme"));
  await fs.copyFile(path.join(themeDirectory, "screen.css"), path.join(outputDirectory, "assets", "theme", "screen.css"));
  await fs.copyFile(path.join(themeDirectory, "print.css"), path.join(outputDirectory, "assets", "theme", "print.css"));

  const assetsDirectory = path.join(themeDirectory, "assets");

  if (await fs.pathExists(assetsDirectory)) {
    await fs.copy(assetsDirectory, path.join(outputDirectory, "assets", "theme", "assets"));
  }
}

export async function buildResume(options: CommonCommandOptions = {}): Promise<BuildResult> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const inputPath = resolveInputPath(cwd, options.input);
  const loaded = await loadResume(inputPath, options.title);
  const theme = await resolveTheme(options.theme || loaded.frontmatter.theme);
  const output = resolveOutput(cwd, options.output);
  const bodyHtml = renderMarkdown(loaded.markdown);
  const assetManager = new AssetManager(loaded.sourceDir);
  const rewrittenBodyHtml = assetManager.rewriteHtml(bodyHtml, "build");
  const html = renderDocument({
    frontmatter: loaded.frontmatter,
    bodyHtml: rewrittenBodyHtml,
    theme,
    assetResolver: (reference) => assetManager.resolveUrl(reference, "build"),
    themeAssetResolver: resolveThemeAssetBuildUrl
  });
  const htmlPath = path.join(output.outputDirectory, output.htmlFilename);

  await fs.ensureDir(output.outputDirectory);
  await fs.remove(path.join(output.outputDirectory, "assets"));
  await copyThemeAssets(theme.directory, output.outputDirectory);
  await assetManager.copyBuildAssets(output.outputDirectory);
  await fs.writeFile(htmlPath, html, "utf8");

  return {
    outputDir: output.outputDirectory,
    htmlPath,
    theme
  };
}
