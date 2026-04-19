import MarkdownIt from "markdown-it";

const renderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

export function renderMarkdown(markdown: string): string {
  return renderer.render(markdown);
}
