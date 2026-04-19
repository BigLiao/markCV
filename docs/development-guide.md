# Development Guide

This document is for contributors and maintainers. User-facing installation and usage stay in [README.md](/Users/liao/My/github/markCV/README.md).

## Environment

- Node.js 20+
- pnpm
- Playwright browser for PDF export

Install dependencies:

```bash
pnpm install
```

Install the PDF browser once:

```bash
pnpm exec playwright install chromium
```

## Core Commands

```bash
pnpm run check
pnpm test
pnpm run build
```

Run the CLI locally:

```bash
node dist/cli.js init ./my-resume
node dist/cli.js dev -i ./my-resume/resume.md --open
node dist/cli.js build -i ./my-resume/resume.md -o ./dist
node dist/cli.js pdf -i ./my-resume/resume.md -o ./dist/resume.pdf
```

Theme tooling:

```bash
node dist/cli.js theme list
node dist/cli.js theme create ./themes/my-theme
node dist/cli.js theme check default
node dist/cli.js theme check ./themes/my-theme
```

## Project Layout

```text
src/cli/index.ts
src/core/frontmatter.ts
src/core/markdown.ts
src/core/assets.ts
src/core/render.ts
src/core/theme.ts
src/core/build.ts
src/core/dev.ts
src/core/pdf.ts

themes/
tests/
docs/
```

## Architecture Notes

Main flow:

```text
resume.md
-> frontmatter
-> markdown-it
-> contentHtml
-> nunjucks theme template
-> themed HTML
-> PDF
```

Theme packages now contain:

- `theme.json`
- `template.njk`
- `screen.css`
- `print.css`
- `assets/`

Related design docs:

- [MarkCV 2.0](/Users/liao/My/github/markCV/docs/markcv-2.0.md)
- [System Design](/Users/liao/My/github/markCV/docs/system-design.md)
- [Theme Development](/Users/liao/My/github/markCV/docs/theme-development.md)

## GitHub Pages

Build the demo site locally:

```bash
pnpm run build:site
```

This generates `site/index.html` plus one static HTML build for every `examples/**/*.md` file across all built-in themes.

To publish with GitHub Pages:

1. Push `.github/workflows/pages.yml` to `main` or `master`.
2. In repository Settings -> Pages, set Source to `GitHub Actions`.
3. Push again, or run the `Pages` workflow manually.

Project Pages URLs usually look like `https://<owner>.github.io/<repo>/`.

## Release

### One-time setup

1. Create an npm access token of type `Automation`.
2. Add it to GitHub repository secrets as `NPM_TOKEN`.

### Publish a release

```bash
pnpm version patch
pnpm version minor
pnpm version major

git push
git push --tags
```

After a `v*` tag is pushed, GitHub Actions will:

1. install dependencies
2. run type check, tests, and build
3. publish the npm package
4. create a GitHub Release

## CI

- `.github/workflows/ci.yml`
  - runs on branch pushes and PRs
  - validates Node 18 / 20
- `.github/workflows/publish.yml`
  - runs on `v*` tags
  - publishes to npm and creates a GitHub Release
