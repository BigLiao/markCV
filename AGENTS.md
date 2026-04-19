# AGENTS

## 概述

MarkCV 2.0 是一个 Markdown-first 的简历渲染器。

- 输入：`resume.md`
- frontmatter：`theme`、`title`、`lang`、`basics`、`pdf`
- 正文：原生 Markdown，直接渲染为 HTML
- 输出：预览、HTML、A4 PDF

不要引入重 schema、正文语义解析或主题专属 Markdown DSL。

## 项目结构

```text
src/cli/index.ts        # CLI 入口
src/core/frontmatter.ts # frontmatter 解析
src/core/markdown.ts    # Markdown 渲染
src/core/assets.ts      # 本地资源改写/复制
src/core/render.ts      # 主题模板渲染
src/core/theme.ts       # 主题加载/校验
src/core/build.ts       # HTML 构建
src/core/dev.ts         # 本地预览
src/core/pdf.ts         # PDF 导出

themes/default/         # 默认主题
themes/minimal/         # 极简主题
themes/legacy/          # 旧版兼容主题

tests/build.test.ts
tests/fixtures/
tests/__snapshots__/
```

## 核心架构

主链路：

```text
resume.md
-> frontmatter
-> markdown-it
-> contentHtml
-> 资源路径改写
-> theme template
-> theme screen.css / print.css
-> HTML / PDF
```

主题控制模板、CSS 和静态资源，不参与正文解析。

## 开发

环境：

- Node.js 20+
- `pnpm install`
- PDF 需要：`pnpm exec playwright install chromium`

常用命令：

```bash
pnpm run check
pnpm test
pnpm run build

node dist/cli.js init ./my-resume
node dist/cli.js dev -i ./my-resume/resume.md --open
node dist/cli.js build -i ./my-resume/resume.md -o ./dist
node dist/cli.js pdf -i ./my-resume/resume.md -o ./dist/resume.pdf

node dist/cli.js theme list
node dist/cli.js theme create ./themes/my-theme
node dist/cli.js theme check default
```

旧版示例：

```bash
node dist/cli.js dev -i ./examples/legacy/resume.md -t legacy
```

## 发布

前置：

1. 在 npm 创建 `Automation` token
2. 在 GitHub Actions secrets 中配置 `NPM_TOKEN`

发布：

```bash
pnpm version patch
pnpm version minor
pnpm version major
git push && git push --tags
```

流水线：

- `.github/workflows/ci.yml`
  - push/PR 到 `main` / `master`
  - Node 18 / 20
  - 运行 `check`、`test`、`build`
- `.github/workflows/publish.yml`
  - `v*` tag 触发
  - 发布 npm
  - 创建 GitHub Release
