# MarkCV

Write your resume in Markdown. Get a beautiful page.

[![npm version](https://img.shields.io/npm/v/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![npm downloads](https://img.shields.io/npm/dm/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![CI](https://github.com/BigLiao/markCV/actions/workflows/ci.yml/badge.svg)](https://github.com/BigLiao/markCV/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/mark-cv)](https://github.com/BigLiao/markCV/blob/master/LICENSE)

[中文说明](./README.zh-CN.md)

**You focus on the words. MarkCV handles the rest.**

One Markdown file is all you need. No templates to wrestle, no CSS to debug, no resume-specific DSL to learn. Write plain Markdown, pick a theme, export to HTML or PDF — done.

### Why MarkCV?

- **Pure Markdown** — your resume is a `.md` file, readable anywhere, version-controllable with Git.
- **Content & style, separated** — switch themes in one line; your content stays untouched.
- **6 built-in themes** — from clean & minimal to cyberpunk neon. Or build your own.
- **Pixel-perfect PDF** — A4 export powered by Playwright, what you see is what you print.
- **Zero config to start** — `markcv init` → `markcv dev` → done.

## Install

Install from npm:

```bash
npm install -g mark-cv
```

Or run without a global install:

```bash
npx mark-cv --help
```

If you want PDF export, install the Playwright browser once:

```bash
npx playwright install chromium
```

## Quick Start

Create a starter resume:

```bash
markcv init ./my-resume
```

Preview it:

```bash
markcv dev -i ./my-resume/resume.md --open
```

Build HTML:

```bash
markcv build -i ./my-resume/resume.md -o ./my-resume/dist
```

Export PDF:

```bash
markcv pdf -i ./my-resume/resume.md -o ./my-resume/resume.pdf
```

## Demo

Theme gallery and example pages:

- [https://bigliao.github.io/markCV/](https://bigliao.github.io/markCV/)

## `resume.md`

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

## Summary

Seven years building product experiences across content platforms, collaboration tools, and design systems.
```

The body stays plain Markdown. MarkCV does not require a resume-specific DSL.

## Theme Commands

```bash
markcv theme list
markcv theme create ./themes/my-theme
markcv theme check default
markcv theme check ./themes/my-theme
```

Built-in themes:

- `antique-book`
- `cyberpunk`
- `default`
- `matrix`
- `minimal`
- `legacy`

Legacy example:

```bash
markcv dev -i ./examples/legacy/resume.md -t legacy
```

## Docs

- [Theme Development](./docs/theme-development.md)
- [Development Guide](./docs/development-guide.md)
