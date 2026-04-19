# MarkCV 2.0

[![npm version](https://img.shields.io/npm/v/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![npm downloads](https://img.shields.io/npm/dm/mark-cv)](https://www.npmjs.com/package/mark-cv)
[![CI](https://github.com/BigLiao/markCV/actions/workflows/ci.yml/badge.svg)](https://github.com/BigLiao/markCV/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/mark-cv)](https://github.com/BigLiao/markCV/blob/master/LICENSE)

一个以 Markdown 为中心的简历渲染器，支持主题化 HTML 输出和 A4 PDF 导出。

[English README](./README.md)

## 介绍

MarkCV 保持很克制的输入模型：

- 一个 `resume.md`
- 用 YAML frontmatter 提供 `basics`、`theme`、`title`、`lang`、`pdf`
- 用原生 Markdown 编写正文

然后把内容渲染进主题包：

- `template.njk`
- `screen.css`
- `print.css`
- `assets/`

这样可以保持内容和表现分离，同时让主题拥有足够强的页面结构、装饰元素和打印能力。

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

- [主题开发](/Users/liao/My/github/markCV/docs/theme-development.md)
- [开发指南](/Users/liao/My/github/markCV/docs/development-guide.md)
