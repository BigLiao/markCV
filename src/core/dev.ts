import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import chokidar from "chokidar";
import open from "open";

import { BUILTIN_THEMES_DIR, DEFAULT_DEV_PORT, DEFAULT_INPUT } from "../constants.js";
import type { DevCommandOptions } from "../types.js";
import { AssetManager } from "./assets.js";
import { loadResume } from "./frontmatter.js";
import { renderMarkdown } from "./markdown.js";
import { renderDocument } from "./render.js";
import { resolveTheme } from "./theme.js";

const reloadClient = `
<script>
  const source = new EventSource("/__markcv/events");
  source.onmessage = () => window.location.reload();
</script>
`;

function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".json":
      return "application/json; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function resolveThemeAssetDevUrl(reference: string): string {
  if (reference === "screen.css" || reference === "print.css") {
    return `/__markcv/theme/${reference}`;
  }

  if (reference.startsWith("assets/")) {
    return `/__markcv/theme/${reference}`;
  }

  throw new Error(`Unsupported theme asset reference: ${reference}`);
}

export async function startDevServer(options: DevCommandOptions = {}): Promise<void> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const inputPath = path.resolve(cwd, options.input || DEFAULT_INPUT);
  const port = options.port || DEFAULT_DEV_PORT;
  const clients = new Set<http.ServerResponse>();
  let currentHtml = "<!doctype html><html><body><p>Loading…</p></body></html>";
  let currentThemeDirectory = "";
  let currentThemeScreenCssPath = "";
  let currentThemePrintCssPath = "";
  let currentThemeAssetsDirectory = "";
  let currentAssetManager = new AssetManager(cwd);

  const renderCurrentState = async () => {
    const loaded = await loadResume(inputPath, options.title);
    const theme = await resolveTheme(options.theme || loaded.frontmatter.theme);
    const bodyHtml = renderMarkdown(loaded.markdown);
    const assetManager = new AssetManager(loaded.sourceDir);
    const rewrittenBodyHtml = assetManager.rewriteHtml(bodyHtml, "dev");
    const html = renderDocument({
      frontmatter: loaded.frontmatter,
      bodyHtml: rewrittenBodyHtml,
      theme,
      assetResolver: (reference) => assetManager.resolveUrl(reference, "dev"),
      themeAssetResolver: resolveThemeAssetDevUrl
    });

    currentHtml = html.replace("</body>", `${reloadClient}</body>`);
    currentThemeDirectory = theme.directory;
    currentThemeScreenCssPath = theme.screenCssPath;
    currentThemePrintCssPath = theme.printCssPath;
    currentThemeAssetsDirectory = theme.assetsDirectory || "";
    currentAssetManager = assetManager;
    watcher.add(currentThemeDirectory);
  };

  const notifyReload = () => {
    for (const client of clients) {
      client.write("data: reload\n\n");
    }
  };

  const watcher = chokidar.watch([inputPath, path.dirname(inputPath), BUILTIN_THEMES_DIR], {
    ignoreInitial: true
  });

  await renderCurrentState();

  watcher.on("all", async () => {
    try {
      await renderCurrentState();
      notifyReload();
    } catch (error) {
      const message = error instanceof Error ? error.stack || error.message : String(error);
      currentHtml = `<!doctype html><html><body><pre>${message}</pre>${reloadClient}</body></html>`;
      notifyReload();
    }
  });

  const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;

    if (pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(currentHtml);
      return;
    }

    if (pathname === "/__markcv/events") {
      response.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive"
      });
      response.write("\n");
      clients.add(response);
      request.on("close", () => {
        clients.delete(response);
      });
      return;
    }

    const serveFile = async (filePath: string) => {
      try {
        const buffer = await fs.readFile(filePath);
        response.writeHead(200, { "content-type": getContentType(filePath) });
        response.end(buffer);
      } catch {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
      }
    };

    if (pathname === "/__markcv/theme/screen.css") {
      await serveFile(currentThemeScreenCssPath);
      return;
    }

    if (pathname === "/__markcv/theme/print.css") {
      await serveFile(currentThemePrintCssPath);
      return;
    }

    if (pathname.startsWith("/__markcv/theme/assets/") && currentThemeAssetsDirectory) {
      const relativePath = pathname.replace("/__markcv/theme/assets/", "");
      await serveFile(path.join(currentThemeAssetsDirectory, relativePath));
      return;
    }

    if (pathname.startsWith("/__markcv/content/")) {
      const assetPath = currentAssetManager.getDevAssetPath(pathname);

      if (assetPath) {
        await serveFile(assetPath);
        return;
      }
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });

  await new Promise<void>((resolve) => {
    server.listen(port, resolve);
  });

  const url = `http://127.0.0.1:${port}`;
  console.log(`MarkCV dev server running at ${url}`);

  if (options.open) {
    await open(url);
  }

  const close = async () => {
    await watcher.close();
    for (const client of clients) {
      client.end();
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  };

  process.once("SIGINT", () => {
    void close().finally(() => process.exit(0));
  });

  process.once("SIGTERM", () => {
    void close().finally(() => process.exit(0));
  });
}
