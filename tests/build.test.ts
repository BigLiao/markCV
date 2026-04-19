import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import fsExtra from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";

import { buildResume } from "../src/core/build.js";
import { checkTheme, createThemeScaffold } from "../src/core/theme.js";

const fixtureDirectory = path.resolve("tests/fixtures/example-resume");
const legacyFixtureDirectory = path.resolve("tests/fixtures/legacy-resume");
const tempDirectories: string[] = [];

async function createTempDirectory() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "markcv-test-"));
  tempDirectories.push(directory);
  return directory;
}

async function createWorkspaceFromFixture() {
  const workspace = await createTempDirectory();
  await fsExtra.copy(fixtureDirectory, workspace);
  return workspace;
}

async function createWorkspaceFromLegacyFixture() {
  const workspace = await createTempDirectory();
  await fsExtra.copy(legacyFixtureDirectory, workspace);
  return workspace;
}

afterEach(async () => {
  while (tempDirectories.length > 0) {
    const directory = tempDirectories.pop();

    if (directory) {
      await fsExtra.remove(directory);
    }
  }
});

describe("buildResume", () => {
  it("builds the example resume with the default theme", async () => {
    const workspace = await createWorkspaceFromFixture();
    const outputPath = path.join(workspace, "dist-default");
    const result = await buildResume({
      cwd: workspace,
      input: path.join(workspace, "resume.md"),
      output: outputPath
    });
    const html = await fs.readFile(result.htmlPath, "utf8");

    expect(result.theme.name).toBe("default");
    expect(html).toContain("theme-default");
    expect(html).toContain("./assets/content/001-portfolio-preview.svg");
    expect(html).toContain("./assets/content/002-avatar.svg");
    expect(await fsExtra.pathExists(path.join(outputPath, "assets", "theme", "screen.css"))).toBe(true);
    expect(await fsExtra.pathExists(path.join(outputPath, "assets", "content", "001-portfolio-preview.svg"))).toBe(true);
    expect(html).toMatchSnapshot();
  });

  it("builds the same example resume with the minimal theme override", async () => {
    const workspace = await createWorkspaceFromFixture();
    const outputPath = path.join(workspace, "dist-minimal");
    const result = await buildResume({
      cwd: workspace,
      input: path.join(workspace, "resume.md"),
      output: outputPath,
      theme: "minimal"
    });
    const html = await fs.readFile(result.htmlPath, "utf8");
    const screenCss = await fs.readFile(path.join(outputPath, "assets", "theme", "screen.css"), "utf8");

    expect(result.theme.name).toBe("minimal");
    expect(html).toContain("theme-minimal");
    expect(screenCss).toContain(".mcv-page");
    expect(screenCss).toContain("IBM Plex Sans");
    expect(html).toMatchSnapshot();
  });

  it("builds the legacy example resume with the legacy theme", async () => {
    const workspace = await createWorkspaceFromLegacyFixture();
    const outputPath = path.join(workspace, "dist-legacy");
    const result = await buildResume({
      cwd: workspace,
      input: path.join(workspace, "resume.md"),
      output: outputPath
    });
    const html = await fs.readFile(result.htmlPath, "utf8");
    const screenCss = await fs.readFile(path.join(outputPath, "assets", "theme", "screen.css"), "utf8");

    expect(result.theme.name).toBe("legacy");
    expect(html).toContain("theme-legacy");
    expect(html).toContain("bigLiao");
    expect(html).toContain("如何导出简历");
    expect(screenCss).toContain("stick.png");
    expect(await fsExtra.pathExists(path.join(outputPath, "assets", "theme", "assets", "pin-left.png"))).toBe(true);
    expect(await fsExtra.pathExists(path.join(outputPath, "assets", "content", "001-avatar.jpeg"))).toBe(true);
    expect(html).toMatchSnapshot();
  });
});

describe("checkTheme", () => {
  it("passes the built-in themes", async () => {
    await expect(checkTheme("default")).resolves.toMatchObject({
      ok: true,
      issues: []
    });
    await expect(checkTheme("minimal")).resolves.toMatchObject({
      ok: true,
      issues: []
    });
    await expect(checkTheme("legacy")).resolves.toMatchObject({
      ok: true,
      issues: []
    });
  });

  it("creates a theme scaffold with a default template", async () => {
    const workspace = await createTempDirectory();
    const themeDirectory = path.join(workspace, "paper-note");
    const createdDirectory = await createThemeScaffold("paper-note", themeDirectory);

    expect(createdDirectory).toBe(themeDirectory);
    expect(await fsExtra.pathExists(path.join(themeDirectory, "template.njk"))).toBe(true);
    await expect(checkTheme(themeDirectory)).resolves.toMatchObject({
      ok: true,
      issues: []
    });
  });

  it("builds a local theme without screen.css or print.css by using the default theme stylesheets", async () => {
    const workspace = await createWorkspaceFromFixture();
    const themeDirectory = path.join(workspace, "paper-note");
    const outputPath = path.join(workspace, "dist-paper-note");

    await createThemeScaffold("paper-note", themeDirectory);

    const result = await buildResume({
      cwd: workspace,
      input: path.join(workspace, "resume.md"),
      output: outputPath,
      theme: themeDirectory
    });
    const screenCss = await fs.readFile(path.join(outputPath, "assets", "theme", "screen.css"), "utf8");
    const printCss = await fs.readFile(path.join(outputPath, "assets", "theme", "print.css"), "utf8");

    expect(result.theme.name).toBe("paper-note");
    expect(result.theme.screenCssPath).toBeUndefined();
    expect(result.theme.printCssPath).toBeUndefined();
    expect(screenCss).toContain("--mcv-page-width");
    expect(screenCss).toContain(".mcv-content h2");
    expect(printCss).toContain("@page");
    expect(printCss).toContain(".mcv-content h1");
    expect(printCss).toContain("break-after: avoid-page");
    expect(printCss).toContain(".mcv-content h4 + *");
  });
});
