import type { Basics, FrontmatterConfig, ResolvedTheme } from "../types.js";
import { escapeHtml, joinClassNames } from "../utils/html.js";

type RenderDocumentOptions = {
  frontmatter: FrontmatterConfig;
  bodyHtml: string;
  theme: ResolvedTheme;
  screenCssHref: string;
  printCssHref: string;
  mode: "dev" | "build";
  assetResolver: (reference: string | undefined, mode: "dev" | "build") => string | undefined;
};

function buildContactItems(basics: Basics | undefined): string[] {
  if (!basics) {
    return [];
  }

  const items: string[] = [];

  const pushText = (label: string, value?: string) => {
    if (!value) {
      return;
    }

    items.push(`<li class="mcv-contact-item"><span class="mcv-contact-label">${label}</span><span class="mcv-contact-value">${escapeHtml(value)}</span></li>`);
  };

  const pushLink = (label: string, href?: string, text?: string) => {
    if (!href) {
      return;
    }

    items.push(
      `<li class="mcv-contact-item"><span class="mcv-contact-label">${label}</span><a class="mcv-contact-link" href="${escapeHtml(href)}">${escapeHtml(text || href)}</a></li>`
    );
  };

  pushLink("Email", basics.email ? `mailto:${basics.email}` : undefined, basics.email);
  pushText("Phone", basics.phone);
  pushText("Location", basics.location);
  pushLink("Website", basics.website);
  pushLink("GitHub", basics.github);

  for (const link of basics.extraLinks ?? []) {
    pushLink(link.label, link.href, link.label);
  }

  return items;
}

function renderHeader(frontmatter: FrontmatterConfig, assetResolver: RenderDocumentOptions["assetResolver"], mode: "dev" | "build"): string {
  const basics = frontmatter.basics;

  if (
    !basics ||
    Object.values(basics).every((value) =>
      value == null || value === "" || (Array.isArray(value) && value.length === 0)
    )
  ) {
    return "";
  }

  const contactItems = buildContactItems(basics);
  const avatarUrl = assetResolver(basics.avatar, mode);

  return `
    <header class="mcv-header">
      <div class="mcv-header-main">
        ${basics.name ? `<h1 class="mcv-name">${escapeHtml(basics.name)}</h1>` : ""}
        ${basics.headline ? `<p class="mcv-headline">${escapeHtml(basics.headline)}</p>` : ""}
        ${basics.summary ? `<p class="mcv-summary">${escapeHtml(basics.summary)}</p>` : ""}
        ${contactItems.length > 0 ? `<ul class="mcv-contacts">${contactItems.join("")}</ul>` : ""}
      </div>
      ${avatarUrl ? `<div class="mcv-header-avatar"><img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(basics.name || "Avatar")}" /></div>` : ""}
    </header>
  `;
}

export function renderDocument(options: RenderDocumentOptions): string {
  const { frontmatter, bodyHtml, theme, screenCssHref, printCssHref, assetResolver, mode } = options;
  const title = frontmatter.title || frontmatter.basics?.name || "Resume";
  const lang = frontmatter.lang || "zh-CN";
  const headerHtml = renderHeader(frontmatter, assetResolver, mode);
  const poweredByHref = "https://github.com/BigLiao/markCV";

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="MarkCV 2.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="${escapeHtml(screenCssHref)}" media="screen" />
    <link rel="stylesheet" href="${escapeHtml(printCssHref)}" media="print" />
  </head>
  <body class="${joinClassNames("mcv", `theme-${theme.name}`)}">
    <main class="mcv-shell">
      <section class="mcv-page-wrap">
        <div class="mcv-pin mcv-pin-left" aria-hidden="true"></div>
        <div class="mcv-pin mcv-pin-right" aria-hidden="true"></div>
        <main class="mcv-page">
          ${headerHtml}
          <article class="mcv-content markdown-body">
            ${bodyHtml}
          </article>
        </main>
      </section>
      <aside class="mcv-note" aria-label="Export tips">
        <div class="mcv-note-content">
          如何导出简历？<br />
          1）右键选择“打印”<br />
          2）目标打印机设置为“另存为PDF”
        </div>
      </aside>
    </main>
    <footer class="mcv-footer">
      Powered by <a class="mcv-footer-link" href="${poweredByHref}">markCV</a>
    </footer>
  </body>
</html>
`;
}
