import path from "node:path";

import fs from "fs-extra";

const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#DCE7F5" />
  <circle cx="256" cy="190" r="84" fill="#5271A5" />
  <path d="M128 416C128 337.575 191.575 274 270 274H242C320.425 274 384 337.575 384 416V432H128V416Z" fill="#5271A5" />
</svg>
`;

const sampleResume = `---
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
  summary: Product designer focused on content systems, interaction details, and shipping work fast.
---

## Summary

Seven years building product experiences across content platforms, collaboration tools, and design systems.

## Experience

### Senior Product Designer · Example Studio

- Led the redesign of a B2B workflow product used by 20,000+ monthly users.
- Built a design system that reduced delivery time for new screens by 35%.
- Worked closely with engineering on responsive, print-friendly interfaces.

## Projects

### MarkCV 2.0

- Defined the Markdown-first authoring experience.
- Designed theme constraints for reliable A4 output.

## Education

### Bachelor of Industrial Design · Southeast University
`;

export async function initResume(targetDirectory: string, force = false): Promise<string> {
  const absoluteTargetDirectory = path.resolve(targetDirectory);
  const resumePath = path.join(absoluteTargetDirectory, "resume.md");
  const assetsDirectory = path.join(absoluteTargetDirectory, "assets");
  const avatarPath = path.join(assetsDirectory, "avatar.svg");

  if (!force && (await fs.pathExists(resumePath))) {
    throw new Error(`Refusing to overwrite existing file: ${resumePath}`);
  }

  await fs.ensureDir(assetsDirectory);
  await fs.writeFile(avatarPath, avatarSvg, "utf8");
  await fs.writeFile(resumePath, sampleResume, "utf8");

  return resumePath;
}
