# MarkCV 2.0

## 产品定位

MarkCV 2.0 是一个原生 Markdown 简历渲染器。

它的目标不是做在线编辑器，也不是做重 schema 的简历平台，而是让用户维护一个 `resume.md`，稳定地产出专业的简历网页和 A4 PDF。

MarkCV 2.0 会部分借鉴 RenderCV 的产品思路，例如：

- 主题化输出
- 稳定的打印规范
- 专业、克制的简历版式

但它不会把自己定位成“Markdown 版 RenderCV”。它和 RenderCV 的核心差异是：

- 输入仍然以原生 Markdown 为中心
- 不引入复杂的结构化内容模型
- 不要求用户学习额外的正文语法
- 只在必要处补充极少量元信息

MarkCV 2.0 的核心特点应该始终保持为：

- 只要是标准 Markdown，就应该能展示出来
- 用户写内容时不需要承担过多额外心智负担
- 主题切换不应该要求重写正文内容
- Header 等基础信息通过 frontmatter 提供，正文内容保持纯 Markdown

## 它不是什么

MarkCV 2.0 不是下面这些产品：

- 不是在线编辑器
- 不是拖拽排版工具
- 不是通用静态站生成器
- 不是 JSON/YAML 驱动的重 schema 简历系统
- 不是带复杂布局 DSL 的 Markdown 方言

## 设计原则

### 1. Markdown First

Markdown 是内容的唯一输入形式，用户主要面对的是一个 `resume.md` 文件。

### 2. 内容优先

用户应该优先思考“写什么”，而不是“怎么摆”。版式问题尽量由主题解决。

### 3. 额外语法保持克制

MarkCV 2.0 不应该为了追求布局能力而引入太多新的写法。只有在 Markdown 本身无法很好表达时，才通过 metadata 做少量补充。

### 4. 主题切换无内容改写

切换主题时，不应要求用户修改正文结构，也不应要求用户学习主题专属语法。

### 5. 默认输出必须像简历

无论屏幕预览还是 PDF 输出，最终结果都必须符合简历的基本视觉规范，包括 A4 页面、清晰的层级、稳定的分页和适度的信息密度。

## 输入模型

MarkCV 2.0 仍然以单个 `resume.md` 作为输入。

文件由两部分组成：

1. YAML frontmatter
2. Markdown 正文

frontmatter 只承担少量职责：

- 选择主题
- 定义基础信息字段
- 定义少量与输出直接相关的元信息

正文则保持 Markdown 原生表达，尽量不添加新的规则。

当前收敛后的约定是：

- 其他 Markdown 语法保持原样支持
- 原生 HTML 允许混写，但主题不承诺专门适配所有自定义 HTML 结构

也就是说，MarkCV 2.0 不会要求用户在正文里写复杂的布局指令、栅格语法或简历专用 DSL，也不会对正文做额外的简历语义解析。

建议的 frontmatter 范围保持克制，只包含两类信息：

1. 页面配置
2. 基础信息

例如：

```md
---
theme: default
title: 张三的简历
basics:
  name: 张三
  headline: Frontend Engineer
  avatar: ./avatar.png
  email: zhangsan@example.com
  phone: 13800000000
  location: Shanghai
  website: https://example.com
  github: https://github.com/zhangsan
pdf:
  format: A4
---
```

其中 `basics` 只用于 Header 和元信息，不承担正文内容组织职责。

## Header 方案

Header 信息由 frontmatter 中的 `basics` 提供，正文不负责表达 Header 结构。

推荐保留的基础字段：

- `name`
- `headline`
- `avatar`
- `summary`
- `email`
- `phone`
- `location`
- `website`
- `github`
- `extraLinks`

这样做的目的有两个：

1. 保证简历作者容易理解、容易填写
2. 保证主题作者能够稳定地实现头像、标题和联系方式版式

这意味着：

- 不再使用 `blocks` 这类较重抽象
- 不要求在正文里通过 Markdown 或 HTML 手工拼接 Header
- 主题可以自由决定 Header 排布方式，但不应要求用户改写 `basics` 字段结构

## 直接渲染链路

MarkCV 2.0 不做 RenderCV 那样的重型结构化模型，也不对正文做额外的简历语义提取。

它的核心渲染链路应该尽量简单：

1. 解析 frontmatter
2. 提取 `basics` 和页面配置
3. 将正文 Markdown 直接渲染为 HTML
4. 注入主题样式
5. 输出页面与 PDF

也就是说，MarkCV 2.0 不再依赖正文 section 拆分、条目识别或语义增强。主题面对的是：

- frontmatter 中的基础信息
- 完整的 Markdown 渲染结果
- 通用的页面配置

它不会做下面这些事情：

- 不把工作经历、项目、教育等内容强行建模成重类型对象
- 不要求正文符合特定 section 层级
- 不自动推断正文布局
- 不把 Markdown 变成新的简历 DSL

## 主题系统

主题系统是 MarkCV 2.0 的核心能力之一，但它的职责必须非常清楚：主题负责页面结构、装饰元素和视觉样式，Markdown 只负责内容。

MarkCV 2.0 的主题系统采用：

- 主题 HTML 模板
- 主题 CSS
- 主题静态资源

不采用：

- 主题私有 Markdown 语法
- 主题私有 frontmatter 配置
- 主题控制正文布局的额外 DSL

也就是说，渲染引擎负责把 `resume.md` 解析为 `basics + contentHtml`，再交给主题模板；主题模板负责把这些数据嵌进自己的 HTML 结构里。

这样做的目的在于：

- 允许主题定义自己的页面骨架
- 允许主题添加背景图、纹理、贴纸、图钉、水印等装饰元素
- 保证切换主题时不需要改 Markdown 内容
- 保持 Markdown-first 的产品边界

### 主题目录结构

每个主题都是一个独立目录，例如：

```text
themes/
  paper/
    theme.json
    template.njk
    screen.css
    print.css
    assets/
```

其中：

- `theme.json` 用于声明主题元信息
- `template.njk` 用于定义页面 HTML 骨架
- `screen.css` 用于屏幕预览
- `print.css` 用于打印和 PDF
- `assets/` 用于字体、背景图、装饰图等静态资源

`theme.json` 保持极简，只包含元信息，例如：

```json
{
  "name": "paper",
  "label": "Paper",
  "version": "1.0.0",
  "author": "markcv"
}
```

### 主题输入数据

主题模板只接收一组固定上下文：

- `document.title`
- `document.lang`
- `basics`
- `contentHtml`
- `theme.name`
- `theme.label`
- `helpers.asset()`
- `helpers.themeAsset()`

其中：

- `basics` 来自 frontmatter
- `contentHtml` 是正文 Markdown 渲染后的完整 HTML
- `helpers.asset()` 用于解析用户内容资源
- `helpers.themeAsset()` 用于解析主题目录中的静态资源

主题不能要求额外的内容输入，也不应假设正文具备某种主题专属结构。

### 模板职责边界

主题模板可以控制：

- 页面骨架
- Header 排布
- 背景层和装饰层
- 纸张纹理、贴纸、图钉、水印、角标
- 页脚、注记、边框、叠层
- Markdown 内容在页面中的嵌入位置

主题模板不能控制：

- Markdown 解析规则
- 正文内容语义
- frontmatter 的字段结构
- JavaScript 交互能力

正文 HTML 只有一个入口，也就是 `contentHtml`。主题必须把它嵌入模板中的正文容器，但不允许要求用户把 Markdown 拆成多个区域。

### 模板示意

主题模板的结构大致如下：

```html
<!doctype html>
<html lang="{{ document.lang }}">
  <head>
    <meta charset="UTF-8" />
    <title>{{ document.title }}</title>
    <link rel="stylesheet" href="{{ helpers.themeAsset('screen.css') }}" media="screen" />
    <link rel="stylesheet" href="{{ helpers.themeAsset('print.css') }}" media="print" />
  </head>
  <body class="mcv theme-{{ theme.name }}">
    <div class="paper-bg"></div>
    <div class="paper-pin paper-pin-left"></div>
    <div class="paper-pin paper-pin-right"></div>

    <main class="mcv-page">
      <header class="mcv-header">
        ...
      </header>

      <article class="mcv-content markdown-body">
        {{ contentHtml | safe }}
      </article>
    </main>
  </body>
</html>
```

重点是：

- 背景和装饰元素由模板决定
- 正文始终从 `contentHtml` 注入
- 主题切换只改变模板、样式和资源，不改变 Markdown 写法

### 主题职责边界

主题可以控制：

- 字体
- 颜色
- 间距
- 页面纸张感
- Header 排布
- 头像样式
- 标题层级样式
- 表格、列表、引用、代码块、图片的表现
- 打印分页和细节优化
- 背景图和装饰元素

主题不应该控制：

- 正文内容语义
- 正文结构约定
- 主题专属 Markdown 语法
- `basics` 的数据结构
- 解析逻辑
- JavaScript 交互能力

### 主题创建与校验

MarkCV 2.0 保留这几个主题命令：

- `markcv theme list`
- `markcv theme create`
- `markcv theme check`

其中：

- `markcv theme list`
  - 列出所有内置主题
- `markcv theme create ./themes/my-theme`
  - 生成一个可运行的主题目录骨架
  - 默认包含 `theme.json`、`template.njk`、`screen.css`、`print.css`、`assets/`
  - `template.njk` 为可直接预览的默认模板
- `markcv theme check ./themes/my-theme`
  - 检查主题目录是否满足最小规范
  - 检查必需文件是否存在
  - 检查模板是否使用 `contentHtml`
  - 检查 `print.css` 是否包含 A4 打印规则

### 主题校验方向

后续 `markcv theme check` 应重点检查这些内容：

- 是否存在 `theme.json`
- 是否存在 `template.njk`
- 是否存在 `screen.css`
- 是否存在 `print.css`
- 模板中是否使用 `contentHtml`
- 是否包含 A4 打印规则
- 是否对头像缺失、长链接、图片溢出等情况有基本保护

## CLI 能力

MarkCV 2.0 的 CLI 不应假设用户必须在某个固定项目目录内运行。它应该是一个可以在任意目录执行的工具，用户通过参数显式指定：

- Markdown 文件路径
- 主题路径或主题名
- 输出路径

也就是说，CLI 的核心输入模型应当是：

- 一个 `resume.md`
- 一个主题目录或内置主题名
- 一个可选的输出目录

而不是“进入项目目录后依赖约定俗成的文件结构”。

### 核心命令

第一阶段建议保留这些核心命令：

- `markcv dev`
- `markcv build`
- `markcv pdf`
- `markcv theme list`
- `markcv theme create`
- `markcv theme check`

如果后续仍保留初始化能力，也应设计成可选命令：

- `markcv init`

### 路径与参数设计

CLI 应支持在任意目录运行，并通过参数明确指定输入和输出。

建议的公共参数包括：

- `-i, --input <file>`：指定 Markdown 文件路径
- `-t, --theme <theme>`：指定主题名或主题目录路径
- `-o, --output <path>`：指定输出目录或输出文件路径
- `--title <title>`：可选，覆盖页面标题
- `--open`：开发预览时自动打开浏览器

其中：

- `--input` 是核心参数
- `--theme` 可以接受内置主题名，也可以接受本地主题目录
- `--output` 在 `build` 和 `pdf` 中生效

如果 `resume.md` frontmatter 中也定义了 `theme`，建议优先级为：

1. CLI 参数
2. frontmatter
3. 默认主题

这样可以保证：

- 日常使用时可以把主题写在 Markdown 里
- 临时预览其他主题时不用改内容文件

### 命令形态

建议的命令形态如下：

```bash
markcv dev -i ./resume.md
markcv dev -i ./resume.md -t minimal
markcv build -i ./resume.md -t ./themes/paper -o ./dist
markcv pdf -i ./resume.md -t default -o ./dist/resume.pdf
markcv theme list
markcv theme create my-theme
markcv theme check ./themes/my-theme
```

各命令职责建议如下：

- `markcv dev`
  - 读取指定 Markdown
  - 渲染 HTML
  - 启动本地预览服务
  - 监听 Markdown 文件和主题文件变化

- `markcv build`
  - 读取指定 Markdown
  - 解析 `basics` 和页面配置
  - 渲染 HTML
  - 输出 HTML、样式和所需静态资源

- `markcv pdf`
  - 基于 HTML 渲染结果导出 PDF
  - 默认输出 A4 PDF

- `markcv theme list`
  - 列出所有内置主题

- `markcv theme create`
  - 生成一个新主题目录骨架

- `markcv theme check`
  - 检查主题目录是否满足最小规范

### 运行方式

CLI 第一阶段应该同时支持两种主题来源：

1. 内置主题
2. 本地目录主题

这样既可以满足普通用户直接使用，也可以满足主题开发者在任意目录调试自己的主题。

主题解析规则建议如下：

- 如果 `--theme` 是简单名称，则先在内置主题中查找
- 如果 `--theme` 是路径，则按本地主题目录加载
- 如果未提供 `--theme`，则读取 frontmatter 中的 `theme`
- 如果仍未指定，则回退到默认主题

### 预览与构建闭环

CLI 至少应完整覆盖这三个主要场景：

1. 直接预览
2. 编译 HTML
3. 导出 PDF

这三个场景都必须支持：

- 在任意目录运行
- 指定 Markdown 文件
- 指定主题
- 不依赖固定工程目录结构

## 非目标

当前阶段明确不做：

- 在线编辑器
- 富文本或拖拽排版
- JSON/YAML 独立输入格式
- 正文布局 DSL
- RenderCV 式重 schema
- 文档站或官网系统

## 后续继续细化的内容

这份文档是 MarkCV 2.0 的首版产品方案，后续还需要继续补充这些内容：

- frontmatter 的正式字段表
- Markdown 渲染链路与主题注入方式
- 主题接口与主题规范
- PDF 导出实现方案
- 默认主题的视觉方向
- 测试策略与验收标准
