import path from "node:path";

import { load } from "cheerio";
import fs from "fs-extra";

import { extnameOrDefault, isLocalAssetReference, toPosixPath } from "../utils/paths.js";

type AssetRecord = {
  absolutePath: string;
  buildPath: string;
  devPath: string;
};

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset";
}

export class AssetManager {
  private readonly assetsByAbsolutePath = new Map<string, AssetRecord>();
  private readonly assetsByDevPath = new Map<string, AssetRecord>();
  private sequence = 0;

  constructor(private readonly sourceDirectory: string) {}

  private resolveLocalPath(reference: string): string {
    return path.isAbsolute(reference)
      ? path.resolve(reference)
      : path.resolve(this.sourceDirectory, reference);
  }

  private register(reference: string): AssetRecord {
    const absolutePath = this.resolveLocalPath(reference);
    const existing = this.assetsByAbsolutePath.get(absolutePath);

    if (existing) {
      return existing;
    }

    this.sequence += 1;
    const basename = sanitizeFilename(path.basename(absolutePath, path.extname(absolutePath)));
    const ext = extnameOrDefault(absolutePath);
    const assetName = `${String(this.sequence).padStart(3, "0")}-${basename}${ext}`;
    const record: AssetRecord = {
      absolutePath,
      buildPath: toPosixPath("assets", "content", assetName),
      devPath: `/__markcv/content/${assetName}`
    };

    this.assetsByAbsolutePath.set(absolutePath, record);
    this.assetsByDevPath.set(record.devPath, record);
    return record;
  }

  public resolveUrl(reference: string | undefined, mode: "dev" | "build"): string | undefined {
    if (!reference || !isLocalAssetReference(reference)) {
      return reference;
    }

    const record = this.register(reference);
    return mode === "dev" ? record.devPath : `./${record.buildPath}`;
  }

  public rewriteHtml(html: string, mode: "dev" | "build"): string {
    const $ = load(html, undefined, false);

    const rewrite = (selector: string, attribute: string) => {
      $(selector).each((_, element) => {
        const current = $(element).attr(attribute);

        if (!current || !isLocalAssetReference(current)) {
          return;
        }

        $(element).attr(attribute, this.resolveUrl(current, mode));
      });
    };

    rewrite("img", "src");
    rewrite("source", "src");
    rewrite("video", "poster");
    rewrite("a", "href");

    return $.root().html() || "";
  }

  public getDevAssetPath(requestPathname: string): string | undefined {
    return this.assetsByDevPath.get(requestPathname)?.absolutePath;
  }

  public async copyBuildAssets(outputDirectory: string): Promise<void> {
    for (const asset of this.assetsByAbsolutePath.values()) {
      await fs.ensureDir(path.join(outputDirectory, path.dirname(asset.buildPath)));
      await fs.copyFile(asset.absolutePath, path.join(outputDirectory, asset.buildPath));
    }
  }
}
