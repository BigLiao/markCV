import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

import type { FrontmatterConfig, LoadedResume } from "../types.js";

const extraLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const basicsSchema = z
  .object({
    name: z.string().min(1).optional(),
    headline: z.string().min(1).optional(),
    avatar: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    website: z.string().min(1).optional(),
    github: z.string().min(1).optional(),
    extraLinks: z.array(extraLinkSchema).optional()
  })
  .passthrough()
  .optional();

const frontmatterSchema = z
  .object({
    theme: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    lang: z.string().min(1).optional(),
    basics: basicsSchema,
    pdf: z
      .object({
        format: z.literal("A4").optional(),
        margin: z.string().min(1).optional()
      })
      .passthrough()
      .optional()
  })
  .passthrough();

export async function loadResume(inputPath: string, titleOverride?: string): Promise<LoadedResume> {
  const absoluteInputPath = path.resolve(inputPath);
  const source = await fs.readFile(absoluteInputPath, "utf8");
  const parsed = matter(source);
  const frontmatter = frontmatterSchema.parse(parsed.data) as FrontmatterConfig;

  if (titleOverride) {
    frontmatter.title = titleOverride;
  }

  return {
    inputPath: absoluteInputPath,
    sourceDir: path.dirname(absoluteInputPath),
    markdown: parsed.content.trim(),
    frontmatter
  };
}
