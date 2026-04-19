# MarkCV 2.0

Markdown-first resume renderer with themeable HTML and A4 PDF output.

## What It Does

- Reads a single `resume.md`
- Uses YAML frontmatter for `basics`, `theme`, `title`, and PDF options
- Renders the Markdown body directly to HTML
- Wraps it in a fixed resume shell
- Applies a built-in or local CSS theme
- Supports preview, HTML build, PDF export, and theme tooling

## Install

```bash
npm install
npm run build
```

## Quick Start

Create a starter resume:

```bash
node dist/cli.js init ./my-resume
```

Preview it:

```bash
node dist/cli.js dev -i ./my-resume/resume.md --open
```

Build HTML:

```bash
node dist/cli.js build -i ./my-resume/resume.md -o ./my-resume/dist
```

Export PDF:

```bash
node dist/cli.js pdf -i ./my-resume/resume.md -o ./my-resume/resume.pdf
```

## Frontmatter

```md
---
theme: default
title: Jane Doe - Product Designer
lang: en
basics:
  name: Jane Doe
  headline: Product Designer
  avatar: ./assets/avatar.svg
  email: jane@example.com
  phone: "+86 138 0000 0000"
  location: Shanghai
  website: https://janedoe.design
  github: https://github.com/janedoe
  summary: Product designer focused on content systems and shipping work fast.
---
```

The body stays plain Markdown.

## Theme Commands

```bash
node dist/cli.js theme list
node dist/cli.js theme create ./themes/my-theme
node dist/cli.js theme check default
node dist/cli.js theme check ./themes/my-theme
```

Built-in themes now include `default`, `minimal`, and `legacy`.

Legacy example matching the old markCV style:

```bash
node dist/cli.js dev -i ./examples/legacy/resume.md -t legacy
```

## Development

```bash
npm run check
npm test
npm run build
```

## Release

### One-Time Setup

1. Generate an access token on [npmjs.com](https://www.npmjs.com/) and choose the `Automation` type.
2. In GitHub repository `Settings -> Secrets and variables -> Actions`, add:
   - Name: `NPM_TOKEN`
   - Value: the npm token from the previous step

### Publish a New Version

```bash
# patch release 0.1.0 -> 0.1.1
npm version patch

# minor release 0.1.0 -> 0.2.0
npm version minor

# major release 0.1.0 -> 1.0.0
npm version major

git push && git push --tags
```

After pushing a `v*` tag, GitHub Actions will:

1. Install dependencies and build the package
2. Publish to npm with `npm publish --access public`
3. Create a GitHub Release with generated release notes

### CI Pipelines

- `.github/workflows/ci.yml` runs on push and pull request to `main`/`master`, validating Node 18/20 with type check, tests, and build
- `.github/workflows/publish.yml` runs on `v*` tags and publishes to npm before creating a GitHub Release

Product and architecture docs:

- [MarkCV 2.0](/Users/liao/My/github/markCV/docs/markcv-2.0.md)
- [System Design](/Users/liao/My/github/markCV/docs/system-design.md)
