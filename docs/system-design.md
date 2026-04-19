# MarkCV 2.0 系统设计

> 本文档是 [markcv-2.0.md](/Users/liao/My/github/markCV/docs/markcv-2.0.md:1) 的工程落地设计，描述 2.0 在当前需求下的系统架构、模块边界、渲染链路、主题模板机制和 CLI 行为。

## 1. 设计目标

MarkCV 2.0 的系统设计围绕下面几个目标展开：

- 保持 Markdown-first，正文尽可能完全原生
- 通过 frontmatter 提供最少量的基础信息和输出配置
- 支持在任意目录运行 CLI，通过参数指定输入文件、主题和输出位置
- 支持本地预览、HTML 构建、PDF 导出
- 通过主题模板 + CSS + 资源文件实现更强的换皮能力
- 使用现代 Node.js 和 TypeScript 技术栈重建 1.x 的老旧工程

## 2. 核心架构

MarkCV 2.0 采用简单的单向渲染链路：

```text
resume.md
-> frontmatter 解析
-> Markdown 渲染
-> 主题模板渲染
-> 注入主题样式与资源
-> HTML 输出
-> PDF 导出
```

系统不做重型 resume schema，也不做正文语义增强。核心思路是：

- Header 基础信息通过 `frontmatter.basics` 提供
- 正文 Markdown 直接渲染为 HTML
- 主题通过模板决定页面骨架和装饰元素
- Markdown 内容始终通过单一的 `contentHtml` 嵌入主题

## 3. 模块划分

2.0 采用单 package TypeScript 工程。当前产品范围仍然克制，单包更利于实现和维护。

建议目录：

```text
src/
  cli/
  core/
  utils/

themes/
  default/
  minimal/
  legacy/

docs/
```

模块职责如下：

### 3.1 `src/core/frontmatter`

负责：

- 读取 `resume.md`
- 解析 YAML frontmatter
- 校验 frontmatter 字段
- 规范化 CLI 参数和 frontmatter 配置

输出一个轻量配置对象，例如：

```ts
type MarkcvConfig = {
  title?: string;
  lang?: string;
  theme?: string;
  pdf?: {
    format?: "A4";
  };
  basics?: {
    name: string;
    headline?: string;
    avatar?: string;
    summary?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    extraLinks?: Array<{ label: string; href: string }>;
  };
};
```

### 3.2 `src/core/markdown`

负责：

- 将正文 Markdown 解析并渲染为 HTML
- 支持标准 Markdown 和常用扩展
- 保留原生 HTML 混写能力

这一层不做 section 拆分、语义识别或 resume 结构推断。

### 3.3 `src/core/render`

负责：

- 组装模板渲染上下文
- 把 `basics`、`contentHtml`、页面元信息传给主题模板
- 调用模板引擎生成最终 HTML
- 注入主题样式和页面元信息

这一层统一控制主题上下文、资源解析和最终 HTML 输出，但页面结构本身由主题模板决定。

### 3.4 `src/core/theme`

负责：

- 解析 `--theme` 参数
- 加载内置主题或本地目录主题
- 读取 `theme.json`、`template.njk`、`screen.css`、`print.css`
- 校验主题目录规范
- 提供主题资源路径解析

### 3.5 `src/core/assets`

负责：

- 解析本地资源路径
- 处理 `basics.avatar`
- 处理 Markdown 中的本地图片引用
- 在 `build` 模式复制资源到输出目录
- 在 `dev` 模式通过本地服务暴露资源

### 3.6 `src/core/dev`

负责：

- 启动开发预览服务
- 监听 Markdown 和主题文件变化
- 重新渲染 HTML
- 为浏览器提供实时预览

### 3.7 `src/core/pdf`

负责：

- 读取 HTML 渲染结果
- 调用浏览器引擎进行打印
- 导出 PDF

### 3.8 `src/cli`

负责：

- 命令行参数解析
- 组织 `dev/build/pdf/theme` 等命令
- 错误输出和用户提示

## 4. 渲染引擎设计

### 4.1 输入模型

引擎输入由三部分组成：

1. Markdown 文件路径
2. 主题名或主题路径
3. 输出目标

Markdown 文件由两部分组成：

- YAML frontmatter
- Markdown 正文

frontmatter 只保留以下范围：

- 页面配置：`theme`、`title`、`lang`、`pdf`
- 基础信息：`basics`

正文完全作为 Markdown 内容处理，不对其施加额外的简历 DSL。

### 4.2 Markdown 渲染策略

2.0 渲染器采用“直接 Markdown to HTML”的方案。

具体行为：

- 支持 CommonMark 基础语法
- 支持 GitHub Flavored Markdown
- 支持本地图片
- 允许原生 HTML 混写
- 不对正文标题层级做额外业务解释

对于原生 HTML，2.0 采用“本地可信输入”模型：

- 默认允许 HTML 原样参与渲染
- 不额外做 sanitize
- 主题不保证专门适配任意自定义 HTML 结构

### 4.3 模板渲染

引擎不再生成固定 HTML 壳，而是统一准备主题模板所需的上下文，再交给主题模板输出页面结构。

建议模板上下文如下：

```ts
type ThemeContext = {
  document: {
    title: string;
    lang: string;
  };
  basics?: {
    name: string;
    headline?: string;
    avatar?: string;
    summary?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    extraLinks?: Array<{ label: string; href: string }>;
  };
  contentHtml: string;
  theme: {
    name: string;
    label: string;
  };
  helpers: {
    asset: (value?: string) => string | undefined;
    themeAsset: (value: string) => string;
  };
};
```

主题模板必须消费：

- `contentHtml`
- `document.title`
- `document.lang`

主题模板可以消费：

- `basics`
- `theme`
- `helpers.asset()`
- `helpers.themeAsset()`

一份主题模板的示意结构如下：

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
    <div class="paper-bg"></div>
    <main class="mcv-page">
      <header class="mcv-header">...</header>
      <article class="mcv-content markdown-body">
        {{ contentHtml | safe }}
      </article>
    </main>
  </body>
</html>
```

正文内容只有一个入口，不支持通过 Markdown 本身控制多区域布局。

## 5. 主题系统设计

### 5.1 主题形式

2.0 的主题是模板主题包，而不是纯 CSS 换皮。

一个主题目录结构如下：

```text
themes/
  paper/
    theme.json
    template.njk
    screen.css
    print.css
    assets/
```

`theme.json` 第一阶段最小字段：

```json
{
  "name": "paper",
  "label": "Paper",
  "version": "1.0.0",
  "author": "markcv"
}
```

### 5.2 主题职责

主题可以控制：

- 页面 HTML 骨架
- 背景层和装饰元素
- 字体
- 颜色
- 间距
- Header 排布
- 头像样式
- 标题层级样式
- 列表、表格、引用、代码块、图片的表现
- 打印分页和细节优化

主题不能控制：

- frontmatter 数据结构
- Markdown 解析规则
- 正文语义
- JavaScript 交互能力
- 主题私有正文语法

### 5.3 主题资源加载

主题支持两种来源：

1. 内置主题
2. 本地目录主题

主题解析优先级：

1. CLI `--theme`
2. frontmatter `theme`
3. 默认主题

当 `--theme` 是普通名称时：

- 在内置主题目录中查找

当 `--theme` 是路径时：

- 直接按本地目录加载

### 5.4 模板与样式约束

主题必须自行定义模板中的主要结构，但应遵守这些约束：

- 模板必须输出完整 HTML 文档
- 模板必须使用 `contentHtml`
- 模板应在页面中提供一个正文容器，例如 `.mcv-content`
- 模板应正确处理 `basics` 部分字段缺失的情况
- 模板中可以添加任意装饰元素，但不应要求用户修改 Markdown 内容来适配这些装饰

CSS 仍建议围绕这些基础类名展开，便于主题间保留最低限度的一致性：

- `.mcv`
- `.mcv-page`
- `.mcv-header`
- `.mcv-content`
- `.markdown-body`

### 5.5 主题创建与校验

`markcv theme create` 用于生成主题骨架。默认应生成：

- `theme.json`
- `template.njk`
- `screen.css`
- `print.css`
- `assets/`

其中默认的 `template.njk` 必须是一个可以直接预览的最小模板，而不是空文件。

`markcv theme check` 至少检查：

- `theme.json` 是否存在
- `template.njk` 是否存在
- `screen.css` 是否存在
- `print.css` 是否存在
- 模板是否使用 `contentHtml`
- `print.css` 是否定义 A4 打印规则
- 核心容器类是否有基本样式

## 6. 资产处理设计

### 6.1 资源来源

MarkCV 2.0 的资源包括：

- `basics.avatar`
- Markdown 图片
- 主题内静态资源

### 6.2 路径规则

相对路径统一相对于 Markdown 文件所在目录解析。

例如：

- `resume.md` 在 `/work/cv/resume.md`
- `avatar: ./images/me.png`

则最终解析路径为：

- `/work/cv/images/me.png`

主题资源则统一相对于主题目录中的 `assets/` 解析。

### 6.3 开发模式

在 `dev` 模式下：

- Markdown 源文件目录作为资源根之一
- 主题目录作为资源根之一
- 预览服务直接提供本地资源访问

### 6.4 构建模式

在 `build` 模式下：

- 本地资源复制到输出目录
- 建议输出到 `assets/content/`
- 主题资源输出到 `assets/theme/`
- HTML 中的资源引用统一改写为构建后的相对路径

输出目录建议结构：

```text
dist/
  index.html
  assets/
    content/
    theme/
```

## 7. CLI 设计

CLI 应支持在任意目录执行。

建议命令集合：

- `markcv dev`
- `markcv build`
- `markcv pdf`
- `markcv theme list`
- `markcv theme create`
- `markcv theme check`
- `markcv init`

建议公共参数：

- `-i, --input <file>`
- `-t, --theme <theme>`
- `-o, --output <path>`
- `--title <title>`
- `--open`

命令示例：

```bash
markcv dev -i ./resume.md
markcv dev -i ./resume.md -t minimal
markcv build -i ./resume.md -t ./themes/paper -o ./dist
markcv pdf -i ./resume.md -t default -o ./dist/resume.pdf
markcv theme list
markcv theme create ./themes/my-theme
markcv theme check ./themes/my-theme
```

命令职责：

### 7.1 `markcv dev`

- 读取 Markdown 文件
- 加载主题
- 启动本地预览服务
- 监听 Markdown 和主题文件变化
- 实时更新预览

### 7.2 `markcv build`

- 读取 Markdown 文件
- 渲染 HTML
- 复制资源
- 生成可独立部署的 HTML 输出

### 7.3 `markcv pdf`

- 基于渲染结果导出 PDF
- 默认使用 A4

### 7.4 `markcv theme list`

- 列出内置主题

### 7.5 `markcv theme create`

- 生成主题目录骨架
- 自带可运行的默认模板和样式文件

### 7.6 `markcv theme check`

- 检查主题目录是否合法
- 检查模板、样式和 A4 打印规则

### 7.7 `markcv init`

- 生成示例 `resume.md`
- 生成示例头像路径或占位资源说明

## 8. 预览与 PDF 设计

### 8.1 本地预览

`dev` 模式需要提供：

- 快速启动
- 文件监听
- 样式变更即时刷新
- Markdown 改动即时重渲染

开发预览不需要引入复杂前端框架，重点是稳定渲染和快速反馈。

### 8.2 PDF 导出

PDF 导出基于浏览器打印能力实现。

要求：

- 遵守 `print.css`
- 默认 A4
- 支持本地资源、头像、图片
- 支持 `preferCSSPageSize`

## 9. 技术选型

### 9.1 运行时与语言

- Node.js 20 LTS+
- TypeScript 5.x
- ESM 优先
- `pnpm` 作为默认包管理器

### 9.2 CLI 与构建

- `cac`：轻量现代 CLI 参数解析
- `tsup`：构建 CLI 与库产物
- `tsx`：本地 TypeScript 运行和开发脚本

### 9.3 Markdown 渲染

- `gray-matter`：frontmatter 解析
- `markdown-it`：Markdown 渲染
- 开启 `html`、`linkify`、`typographer`
- 通过 HTML 后处理完成本地资源路径改写

### 9.4 模板渲染

- `nunjucks`：主题模板渲染

### 9.5 配置校验

- `zod`

### 9.6 预览与资源处理

- `chokidar`：文件监听
- `cheerio`：HTML 片段后处理和资源路径改写
- `fs-extra`：资源复制与目录操作
- `open`：本地预览时打开浏览器

### 9.7 PDF 与测试

- `playwright`：PDF 导出
- `vitest`：单元测试和集成测试

## 10. 非目标

当前阶段明确不做：

- 在线编辑器
- 富文本或拖拽排版
- JSON/YAML 独立输入格式
- 正文布局 DSL
- RenderCV 式重 schema
- 主题专属 frontmatter 配置系统
