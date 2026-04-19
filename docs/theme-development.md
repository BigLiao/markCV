# 主题开发

本文档说明 MarkCV 2.0 如何扩展主题，以及创建新主题时的目录结构、模板规则、样式要求和命令用法。

## 1. 设计原则

MarkCV 的主题系统是：

- 主题 HTML 模板
- 主题 CSS
- 主题静态资源

这意味着：

- 主题负责页面结构和视觉表现
- Markdown 只负责内容
- 同一份 `resume.md` 应尽量可以直接切换到不同主题
- 不支持主题私有 Markdown 语法
- 不支持主题私有 frontmatter 配置

## 2. 主题目录结构

一个主题目录至少包含：

```text
themes/my-theme/
  theme.json
  template.njk
  screen.css
  print.css
  assets/
```

说明：

- `theme.json`：主题元信息
- `template.njk`：主题模板
- `screen.css`：屏幕预览样式
- `print.css`：打印和 PDF 样式
- `assets/`：字体、背景图、装饰资源

最小 `theme.json`：

```json
{
  "name": "my-theme",
  "label": "My Theme",
  "version": "0.1.0",
  "author": "you"
}
```

## 3. 主题模板输入

主题模板不会直接拿到 Markdown 原文，而是拿到渲染器提供的上下文。

当前建议的模板上下文：

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

其中：

- `basics` 来自 `resume.md` 的 frontmatter
- `contentHtml` 是正文 Markdown 渲染后的完整 HTML
- `helpers.asset()` 用于解析用户内容资源
- `helpers.themeAsset()` 用于解析主题目录中的静态资源

## 4. 模板规则

### 必须遵守

- 模板必须输出完整 HTML 文档
- 模板必须使用 `contentHtml`
- 模板必须输出一个正文容器，建议类名为 `.mcv-content`
- 模板必须正确处理 `basics` 字段缺失的情况
- 模板必须通过 `helpers.themeAsset()` 引用主题资源

### 可以自由发挥

- 页面骨架
- Header 排布
- 背景图
- 纸张纹理
- 图钉、胶带、贴纸、水印、角标
- 页脚、说明区、边框、叠层

### 不应该做

- 不要要求用户修改 Markdown 正文来适配某个主题
- 不要引入主题专属 Markdown 语法
- 不要依赖 JavaScript 交互
- 不要把正文拆成多个必须的内容槽位

## 5. 模板示例

下面是一份最小可运行模板示意：

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

## 6. 推荐类名

主题可以自由定义额外装饰类名，但建议保留这些基础类名，便于不同主题之间维持最低限度一致性：

- `.mcv`
- `.theme-<name>`
- `.mcv-page`
- `.mcv-header`
- `.mcv-header-main`
- `.mcv-header-avatar`
- `.mcv-name`
- `.mcv-headline`
- `.mcv-summary`
- `.mcv-contacts`
- `.mcv-contact-item`
- `.mcv-contact-label`
- `.mcv-contact-value`
- `.mcv-contact-link`
- `.mcv-content`
- `.markdown-body`

正文内部仍然是标准 Markdown 转出来的 HTML 元素：

- `h1` ~ `h6`
- `p`
- `ul` / `ol` / `li`
- `blockquote`
- `table` / `thead` / `tbody` / `tr` / `th` / `td`
- `pre` / `code`
- `img`
- `hr`
- `a`

## 7. 打印规则

每个主题都必须提供 `print.css`，至少满足：

```css
@page {
  size: A4;
  margin: 0;
}
```

此外建议处理这些点：

- `.mcv-page` 在打印时移除阴影
- 避免标题、表格、代码块、图片在打印中被随意切断
- 使用 `break-inside: avoid`、`break-after` 等规则优化分页
- 保证背景层和装饰层在打印时要么正常显示，要么被显式隐藏

## 8. CLI 命令用法

### 列出内置主题

```bash
markcv theme list
```

### 创建新主题

```bash
markcv theme create ./themes/my-theme
```

这条命令应生成：

- `theme.json`
- `template.njk`
- `screen.css`
- `print.css`
- `assets/`

其中：

- `template.njk` 是一份默认模板
- 默认模板可直接运行，不需要先手工补齐结构
- `screen.css` 和 `print.css` 也是可直接预览的起点

### 检查主题

```bash
markcv theme check ./themes/my-theme
```

当前建议检查这些内容：

1. `theme.json` 是否存在
2. `template.njk` 是否存在
3. `screen.css` 是否存在
4. `print.css` 是否存在
5. `template.njk` 是否使用 `contentHtml`
6. `print.css` 是否包含 `@page { size: A4 }`
7. `screen.css` 是否至少覆盖这些核心选择器：
   - `.mcv-page`
   - `.mcv-header`
   - `.mcv-content`

## 9. 创建新主题的完整步骤

### 第一步：生成骨架

执行：

```bash
markcv theme create ./themes/paper-note
```

执行后目录应类似：

```text
themes/paper-note/
  theme.json
  template.njk
  screen.css
  print.css
  assets/
```

### 第二步：修改主题元信息

编辑 `theme.json`：

```json
{
  "name": "paper-note",
  "label": "Paper Note",
  "version": "0.1.0",
  "author": "your-name"
}
```

### 第三步：修改模板

编辑 `template.njk`，先决定页面骨架。

例如：

- 是否有背景层
- Header 是左右布局还是上下布局
- 是否有纸张纹理
- 是否有贴纸、图钉、页脚、角标

但正文仍然只通过：

```html
{{ contentHtml | safe }}
```

嵌入。

### 第四步：添加主题资源

把背景图、纹理图、图钉图等放到 `assets/` 目录，例如：

```text
themes/paper-note/assets/paper-bg.jpg
themes/paper-note/assets/pin-left.png
themes/paper-note/assets/pin-right.png
```

然后在模板或 CSS 中通过 `helpers.themeAsset()` 或相对路径引用这些资源。

### 第五步：编写屏幕样式

在 `screen.css` 中处理：

- 页面尺寸与居中
- 背景和装饰层
- Header 布局
- 正文字体、层级、间距
- 图片、表格、列表、引用、代码块

### 第六步：编写打印样式

在 `print.css` 中处理：

- `@page { size: A4 }`
- 打印边距
- 隐藏不适合打印的装饰元素
- 分页优化
- 阴影移除

### 第七步：本地预览

执行：

```bash
markcv dev -i ./resume.md -t ./themes/paper-note
```

这一步主要检查：

- 模板是否正常渲染
- 装饰元素是否遮挡正文
- 背景和图片路径是否正确
- Header 缺字段时是否退化正常

### 第八步：主题校验

执行：

```bash
markcv theme check ./themes/paper-note
```

确保主题满足最小结构和打印规则。

### 第九步：构建与 PDF 验证

执行：

```bash
markcv build -i ./resume.md -t ./themes/paper-note -o ./dist/paper-note
markcv pdf -i ./resume.md -t ./themes/paper-note -o ./dist/paper-note/resume.pdf
```

重点检查：

- HTML 资源是否完整复制
- PDF 是否仍然符合 A4
- 打印时背景和装饰是否合理

## 10. 开发建议

### 建议做的事

- 始终围绕 `contentHtml` 组织正文
- 同时考虑屏幕预览和打印结果
- 对长链接、长标题、表格、图片做溢出保护
- 允许 Header 字段部分缺失
- 把复杂视觉表达放在模板和 CSS 里，而不是交给用户配置

### 不建议做的事

- 不要要求用户在 frontmatter 里写主题私有选项
- 不要要求用户写主题专属 Markdown 技巧
- 不要依赖脚本注入页面行为
- 不要把视觉装饰和正文内容耦合在一起
