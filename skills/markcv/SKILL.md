---
name: markcv
description: |
  指导 Agent 使用 MarkCV CLI 完成简历相关的全部操作：新建简历、实时预览、构建 HTML、导出 PDF、管理与编写自定义主题。
  触发场景：用户要求创建简历、预览简历、导出简历 PDF、构建简历 HTML、编写或调试简历主题、切换主题、修改 resume.md、或任何涉及 markcv 命令的任务。
metadata:
  version: "1.0.0"
---

# MarkCV Skill

MarkCV 是一个 Markdown 驱动的简历渲染工具。用户用纯 Markdown 编写简历内容，MarkCV 负责渲染为精美 HTML 并导出为 A4 PDF。

- npm 包名：`mark-cv`
- 仓库：https://github.com/BigLiao/markCV
- Node 要求：>= 20

---

## 1. 安装

```bash
# 全局安装
npm install -g mark-cv
# 或
pnpm add -g mark-cv

# 免安装执行
npx mark-cv --help
pnpm dlx mark-cv --help
```

PDF 导出依赖 Playwright 浏览器，首次使用前需安装：

```bash
npx playwright install chromium
```

---

## 2. 新建简历（init）

```bash
markcv init [目标目录]
```

- 默认在当前目录下生成 `resume.md` 和 `assets/avatar.svg`
- 如果 `resume.md` 已存在会报错，加 `--force` 强制覆盖

示例：

```bash
markcv init ./my-resume
# 生成：
#   my-resume/resume.md
#   my-resume/assets/avatar.svg
```

### resume.md 结构

生成的简历文件由 **YAML frontmatter** + **Markdown 正文** 两部分组成：

```markdown
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

Seven years building product experiences across content platforms...

## Experience

### Senior Product Designer · Example Studio

- Led the redesign of a B2B workflow product...

## Education

### Bachelor of Industrial Design · Southeast University
```

### Frontmatter 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `theme` | `string` | 主题名或本地主题目录路径 |
| `title` | `string` | HTML 页面标题 |
| `lang` | `string` | 语言，如 `en`、`zh-CN` |
| `basics.name` | `string` | 姓名 |
| `basics.headline` | `string` | 职位/一句话定位 |
| `basics.avatar` | `string` | 头像路径（相对于 resume.md） |
| `basics.summary` | `string` | 个人简介 |
| `basics.email` | `string` | 邮箱 |
| `basics.phone` | `string` | 电话 |
| `basics.location` | `string` | 所在地 |
| `basics.website` | `string` | 个人网站 URL |
| `basics.github` | `string` | GitHub URL |
| `basics.extraLinks` | `Array<{label, href}>` | 额外链接 |
| `pdf.format` | `"A4"` | PDF 纸张格式 |
| `pdf.margin` | `string` | PDF 边距 |

正文使用标准 Markdown，无需任何简历专属语法。所有 `basics` 字段都是可选的。

---

## 3. 预览简历（dev）

```bash
markcv dev -i <resume.md 路径> [选项]
```

选项：

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-i, --input <file>` | 简历 Markdown 文件 | — |
| `-t, --theme <theme>` | 主题名或本地主题目录 | frontmatter 中的 theme |
| `-o, --output <path>` | 输出路径 | — |
| `--port <port>` | 预览服务器端口 | `4173` |
| `--open` | 自动打开浏览器 | `false` |
| `--title <title>` | 覆盖页面标题 | — |

示例：

```bash
# 基础预览
markcv dev -i ./my-resume/resume.md

# 自动打开浏览器 + 指定主题
markcv dev -i ./my-resume/resume.md --open -t minimal

# 预览自定义主题
markcv dev -i ./resume.md -t ./themes/my-theme

# 指定端口
markcv dev -i ./resume.md --port 3000 --open
```

dev 服务器支持热重载：修改 `resume.md`、主题模板或 CSS 后浏览器自动刷新。

---

## 4. 构建与导出

### 4.1 构建静态 HTML（build）

```bash
markcv build -i <resume.md 路径> -o <输出目录> [选项]
```

示例：

```bash
markcv build -i ./my-resume/resume.md -o ./my-resume/dist
# 输出完整静态 HTML 到 dist 目录
```

### 4.2 导出 PDF（pdf）

```bash
markcv pdf -i <resume.md 路径> -o <输出文件.pdf> [选项]
```

示例：

```bash
markcv pdf -i ./my-resume/resume.md -o ./my-resume/resume.pdf

# 使用指定主题导出
markcv pdf -i ./resume.md -t cyberpunk -o ./resume-cyberpunk.pdf
```

build 和 pdf 共享以下选项：

| 选项 | 说明 |
|------|------|
| `-i, --input <file>` | 简历 Markdown 文件 |
| `-t, --theme <theme>` | 主题名或本地主题目录 |
| `-o, --output <path>` | 输出路径 |
| `--title <title>` | 覆盖页面标题 |

PDF 导出基于 Playwright，输出 A4 尺寸，所见即所得。

---

## 5. 主题管理（theme）

### 5.1 查看内置主题

```bash
markcv theme list
```

内置主题列表：

| 主题名 | 说明 |
|--------|------|
| `default` | 简洁经典，适合通用场景 |
| `minimal` | 极简风格 |
| `antique-book` | 复古书页风 |
| `cyberpunk` | 赛博朋克霓虹风 |
| `matrix` | 黑客帝国风 |
| `legacy` | 传统简历布局 |

使用内置主题：在 frontmatter 中设置 `theme: <主题名>`，或在命令中通过 `-t <主题名>` 指定。

### 5.2 创建自定义主题

```bash
markcv theme create <目标目录>
```

示例：

```bash
markcv theme create ./themes/my-theme
```

会生成以下脚手架：

```
themes/my-theme/
  theme.json        # 主题元信息
  template.njk      # Nunjucks HTML 模板
  screen.css        # 屏幕预览样式
  print.css         # 打印/PDF 样式
  assets/           # 静态资源目录（字体、图片等）
```

生成的脚手架可直接运行预览，无需手动补齐结构。

### 5.3 检查主题

```bash
markcv theme check <主题名或目录>
```

示例：

```bash
# 检查内置主题
markcv theme check default

# 检查自定义主题
markcv theme check ./themes/my-theme
```

检查项包括：
1. `theme.json` 是否存在
2. `template.njk` 是否存在
3. `screen.css` 是否存在
4. `print.css` 是否存在
5. 模板是否使用了 `contentHtml`
6. `print.css` 是否包含 `@page { size: A4 }`
7. `screen.css` 是否覆盖核心选择器（`.mcv-page`、`.mcv-header`、`.mcv-content`）

---

## 6. 编写自定义主题

### 6.1 主题目录结构

```
themes/<theme-name>/
  theme.json        # 必须 - 主题元信息
  template.njk      # 必须 - Nunjucks 页面模板
  screen.css        # 必须 - 屏幕样式
  print.css         # 必须 - 打印样式
  assets/           # 可选 - 字体、背景图、装饰资源
```

### 6.2 theme.json

```json
{
  "name": "my-theme",
  "label": "My Theme",
  "version": "0.1.0",
  "author": "your-name"
}
```

### 6.3 模板上下文（template.njk 可用变量）

模板引擎为 Nunjucks。模板接收以下上下文：

```
document.title    - 页面标题（string）
document.lang     - 语言（string）
basics            - frontmatter 中的 basics 对象（可能为 undefined）
basics.name       - 姓名
basics.headline   - 职位标题
basics.avatar     - 头像路径
basics.summary    - 个人简介
basics.email      - 邮箱
basics.phone      - 电话
basics.location   - 所在地
basics.website    - 个人网站
basics.github     - GitHub
basics.extraLinks - 额外链接数组 [{label, href}]
contentHtml       - Markdown 正文渲染后的 HTML（string）
theme.name        - 当前主题名
theme.label       - 当前主题显示名
helpers.asset()       - 解析用户内容资源路径
helpers.themeAsset()  - 解析主题静态资源路径
```

### 6.4 最小可运行模板

```html
<!doctype html>
<html lang="{{ document.lang }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ document.title }}</title>
    <link rel="stylesheet" href="{{ helpers.themeAsset('screen.css') }}" media="screen" />
    <link rel="stylesheet" href="{{ helpers.themeAsset('print.css') }}" media="print" />
  </head>
  <body class="mcv theme-{{ theme.name }}">
    <main class="mcv-page">
      <header class="mcv-header">
        <div class="mcv-header-main">
          {% if basics and basics.name %}
          <h1 class="mcv-name">{{ basics.name }}</h1>
          {% endif %}
          {% if basics and basics.headline %}
          <p class="mcv-headline">{{ basics.headline }}</p>
          {% endif %}
        </div>
        {% if basics and basics.avatar %}
        <div class="mcv-header-avatar">
          <img src="{{ helpers.asset(basics.avatar) }}" alt="{{ basics.name or 'Avatar' }}" />
        </div>
        {% endif %}
      </header>

      <article class="mcv-content markdown-body">
        {{ contentHtml | safe }}
      </article>
    </main>
  </body>
</html>
```

### 6.5 模板规则

**必须遵守：**
- 输出完整 HTML 文档（`<!doctype html>` 到 `</html>`）
- 使用 `{{ contentHtml | safe }}` 渲染正文
- 包含正文容器，建议类名 `.mcv-content`
- 正确处理 `basics` 字段缺失（用 `{% if basics and basics.xxx %}` 判断）
- 通过 `helpers.themeAsset()` 引用主题资源

**可以自由发挥：**
- 页面骨架、Header 排布
- 背景图、纸张纹理
- 图钉、胶带、贴纸、水印、角标等装饰
- 页脚、边框、叠层

**不应该做：**
- 要求用户修改 Markdown 来适配主题
- 引入主题专属 Markdown 语法
- 依赖 JavaScript 交互
- 把正文拆成多个必须的内容槽位

### 6.6 推荐类名

保留这些基础类名以保持主题间的兼容性：

```
.mcv                  - body 根类
.theme-<name>         - 主题标识
.mcv-page             - 页面容器
.mcv-header           - 头部区域
.mcv-header-main      - 头部主内容
.mcv-header-avatar    - 头像区域
.mcv-name             - 姓名
.mcv-headline         - 职位标题
.mcv-summary          - 个人简介
.mcv-contacts         - 联系方式列表
.mcv-contact-item     - 联系方式条目
.mcv-contact-label    - 联系方式标签
.mcv-contact-value    - 联系方式值
.mcv-contact-link     - 联系方式链接
.mcv-content          - 正文容器
.markdown-body        - Markdown 渲染内容
```

### 6.7 打印样式要求（print.css）

`print.css` 至少包含：

```css
@page {
  size: A4;
  margin: 0;
}
```

建议还处理：
- `.mcv-page` 打印时移除阴影
- 使用 `break-inside: avoid` 防止标题、表格、代码块被分页切断
- 背景和装饰层在打印时要么正常显示，要么显式隐藏

### 6.8 自定义主题开发完整流程

```bash
# 1. 生成脚手架
markcv theme create ./themes/paper-note

# 2. 编辑 theme.json 填写元信息

# 3. 编辑 template.njk 设计页面骨架

# 4. 将背景图、纹理等资源放入 assets/ 目录

# 5. 编写 screen.css（屏幕预览样式）

# 6. 编写 print.css（打印/PDF 样式）

# 7. 实时预览
markcv dev -i ./resume.md -t ./themes/paper-note --open

# 8. 校验主题完整性
markcv theme check ./themes/paper-note

# 9. 构建 HTML 和导出 PDF 验证最终效果
markcv build -i ./resume.md -t ./themes/paper-note -o ./dist
markcv pdf -i ./resume.md -t ./themes/paper-note -o ./dist/resume.pdf
```

---

## 7. 常用工作流速查

### 从零开始创建简历

```bash
markcv init ./my-resume
# 编辑 ./my-resume/resume.md 填写内容
markcv dev -i ./my-resume/resume.md --open
# 满意后导出
markcv pdf -i ./my-resume/resume.md -o ./my-resume/resume.pdf
```

### 切换主题预览

```bash
markcv dev -i ./resume.md -t minimal --open
markcv dev -i ./resume.md -t cyberpunk --open
markcv dev -i ./resume.md -t antique-book --open
```

### 批量导出多主题 PDF

```bash
for theme in default minimal cyberpunk; do
  markcv pdf -i ./resume.md -t $theme -o ./output/resume-${theme}.pdf
done
```

---

## 8. Agent 行为指引

当用户请求与简历相关的操作时：

1. **编写简历内容**：直接编辑 `resume.md`，遵循 frontmatter + Markdown 正文的格式。所有 `basics` 字段可选，正文使用标准 Markdown。
2. **新建简历**：运行 `markcv init`，然后根据用户提供的信息编辑生成的 `resume.md`。
3. **预览简历**：运行 `markcv dev -i <path> --open`，告知用户浏览器已打开预览。
4. **导出 PDF**：运行 `markcv pdf -i <path> -o <output.pdf>`。如未安装 Playwright 浏览器，先运行 `npx playwright install chromium`。
5. **切换主题**：修改 frontmatter 中的 `theme` 字段，或在命令中用 `-t` 指定。
6. **创建自定义主题**：运行 `markcv theme create`，然后按用户需求编辑模板和样式文件。
7. **调试主题**：运行 `markcv theme check` 检查问题，结合 `markcv dev` 实时预览调试。
