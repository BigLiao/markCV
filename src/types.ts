export type PdfFormat = "A4";

export type BasicLink = {
  label: string;
  href: string;
};

export type Basics = {
  name?: string;
  headline?: string;
  avatar?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  extraLinks?: BasicLink[];
};

export type FrontmatterConfig = {
  theme?: string;
  title?: string;
  lang?: string;
  basics?: Basics;
  pdf?: {
    format?: PdfFormat;
    margin?: string;
  };
};

export type LoadedResume = {
  inputPath: string;
  sourceDir: string;
  markdown: string;
  frontmatter: FrontmatterConfig;
};

export type ThemeMeta = {
  name: string;
  label: string;
  version?: string;
  author?: string;
};

export type ResolvedTheme = ThemeMeta & {
  directory: string;
  templatePath: string;
  screenCssPath?: string;
  printCssPath?: string;
  assetsDirectory?: string;
  source: "builtin" | "local";
};

export type ThemeCheckResult = {
  themePath: string;
  ok: boolean;
  issues: string[];
};

export type BuildResult = {
  outputDir: string;
  htmlPath: string;
  theme: ResolvedTheme;
};

export type CommonCommandOptions = {
  cwd?: string;
  input?: string;
  output?: string;
  theme?: string;
  title?: string;
};

export type DevCommandOptions = CommonCommandOptions & {
  port?: number;
  open?: boolean;
};
