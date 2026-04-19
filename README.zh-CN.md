# MarkCV

用 Markdown 写简历，开箱即用。

[![npm version](https://img.shields.io/npm/v/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![npm downloads](https://img.shields.io/npm/dm/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![CI](https://github.com/BigLiao/markCV/actions/workflows/ci.yml/badge.svg)](https://github.com/BigLiao/markCV/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/mark-cv)](https://github.com/BigLiao/markCV/blob/master/LICENSE)

[English README](./README.md)

**你只管写内容，MarkCV 搞定排版。**

一个 Markdown 文件就是一份简历。不用学模板语法，不用调 CSS，不用适配任何简历 DSL。写好内容、选个主题、导出 HTML 或 PDF —— 就这么简单。

### 为什么选 MarkCV？

- **纯 Markdown** — 简历就是一个 `.md` 文件，随处可读，用 Git 管理版本。
- **内容与样式分离** — 换主题只需改一行，内容纹丝不动。
- **6 款内置主题** — 从极简到赛博朋克，风格任选。也可以自己造。
- **像素级 PDF 导出** — 基于 Playwright 的 A4 导出，所见即所印。
- **零配置起步** — `markcv init` → `markcv dev` → 搞定。

## 安装

全局安装：

```bash
npm install -g mark-cv
```

或者直接用 `npx`：

```bash
npx mark-cv --help
```

如果需要导出 PDF，还需要安装一次 Playwright 浏览器：

```bash
npx playwright install chromium
```

## 快速开始

初始化示例简历：

```bash
markcv init ./my-resume
```

本地预览：

```bash
markcv dev -i ./my-resume/resume.md --open
```

构建 HTML：

```bash
markcv build -i ./my-resume/resume.md -o ./my-resume/dist
```

导出 PDF：

```bash
markcv pdf -i ./my-resume/resume.md -o ./my-resume/resume.pdf
```

## 示例页面

主题预览和示例页面：

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

正文保持原生 Markdown，不要求简历专用 DSL。

## 主题命令

```bash
markcv theme list
markcv theme create ./themes/my-theme
markcv theme check default
markcv theme check ./themes/my-theme
```

当前内置主题：

- `antique-book`
- `cyberpunk`
- `default`
- `matrix`
- `minimal`
- `legacy`

旧版风格示例：

```bash
markcv dev -i ./examples/legacy/resume.md -t legacy
```

## 文档

- [主题开发](./docs/theme-development.md)
- [开发指南](./docs/development-guide.md)
