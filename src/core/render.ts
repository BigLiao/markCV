import path from "node:path";

import nunjucks from "nunjucks";

import { DEFAULT_LANG, DEFAULT_TITLE } from "../constants.js";
import type { FrontmatterConfig, ResolvedTheme } from "../types.js";

type RenderDocumentOptions = {
  frontmatter: FrontmatterConfig;
  bodyHtml: string;
  theme: ResolvedTheme;
  assetResolver: (reference: string | undefined) => string | undefined;
  themeAssetResolver: (reference: string) => string;
};

export function renderDocument(options: RenderDocumentOptions): string {
  const { frontmatter, bodyHtml, theme, assetResolver, themeAssetResolver } = options;
  const title = frontmatter.title || frontmatter.basics?.name || DEFAULT_TITLE;
  const lang = frontmatter.lang || DEFAULT_LANG;
  const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(theme.directory), {
    autoescape: true,
    noCache: true,
    trimBlocks: true,
    lstripBlocks: true
  });

  return environment.render(path.basename(theme.templatePath), {
    document: {
      title,
      lang
    },
    basics: frontmatter.basics,
    contentHtml: bodyHtml,
    theme: {
      name: theme.name,
      label: theme.label
    },
    helpers: {
      asset: assetResolver,
      themeAsset: themeAssetResolver
    }
  });
}
