import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import fsExtra from "fs-extra";
import { chromium } from "playwright";

import type { CommonCommandOptions } from "../types.js";
import { buildResume } from "./build.js";

function resolvePdfPath(cwd: string, output?: string): string {
  if (!output) {
    return path.resolve(cwd, "dist", "resume.pdf");
  }

  const absoluteOutput = path.resolve(cwd, output);
  return absoluteOutput.endsWith(".pdf") ? absoluteOutput : path.join(absoluteOutput, "resume.pdf");
}

export async function exportPdf(options: CommonCommandOptions = {}): Promise<string> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const pdfPath = resolvePdfPath(cwd, options.output);
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "markcv-"));

  try {
    const result = await buildResume({
      ...options,
      cwd,
      output: tempDirectory
    });
    const browser = await chromium.launch();

    try {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(result.htmlPath).href, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true
      });
    } finally {
      await browser.close();
    }

    return pdfPath;
  } finally {
    await fsExtra.remove(tempDirectory);
  }
}
