import path from "node:path";

import { cac } from "cac";

import { APP_NAME, APP_VERSION } from "../constants.js";
import { buildResume } from "../core/build.js";
import { startDevServer } from "../core/dev.js";
import { exportPdf } from "../core/pdf.js";
import { initResume } from "../core/init.js";
import { checkTheme, createThemeScaffold, listBuiltinThemes } from "../core/theme.js";
import type { CommonCommandOptions } from "../types.js";

const cli = cac(APP_NAME);

function applyCommonOptions(command: ReturnType<typeof cli.command>) {
  return command
    .option("-i, --input <file>", "Markdown resume file")
    .option("-t, --theme <theme>", "Built-in theme name or local theme directory")
    .option("-o, --output <path>", "Output directory or file path")
    .option("--title <title>", "Override document title");
}

async function runCommand(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

applyCommonOptions(cli.command("dev", "Preview a resume in the browser"))
  .option("--port <port>", "Preview server port", { default: 4173 })
  .option("--open", "Open the preview in the default browser")
  .action(async (options) => {
    await runCommand(async () => {
      await startDevServer({
        input: options.input,
        theme: options.theme,
        title: options.title,
        output: options.output,
        port: Number(options.port),
        open: Boolean(options.open)
      });
    });
  });

applyCommonOptions(cli.command("build", "Build static HTML output")).action(async (options) => {
  await runCommand(async () => {
    const result = await buildResume(options as CommonCommandOptions);
    console.log(`Built HTML: ${result.htmlPath}`);
  });
});

applyCommonOptions(cli.command("pdf", "Export a PDF")).action(async (options) => {
  await runCommand(async () => {
    const pdfPath = await exportPdf(options as CommonCommandOptions);
    console.log(`Exported PDF: ${pdfPath}`);
  });
});

cli
  .command("theme <action> [value]", "Theme utilities")
  .action(async (action: string, value?: string) => {
    await runCommand(async () => {
      if (action === "list") {
        const themes = await listBuiltinThemes();

        for (const theme of themes) {
          console.log(`${theme.name}\t${theme.label}\t${theme.source}`);
        }

        return;
      }

      if (action === "create") {
        if (!value) {
          throw new Error("theme create requires a target directory or name.");
        }

        const directory = await createThemeScaffold(path.basename(value), value);
        console.log(`Created theme scaffold: ${directory}`);
        return;
      }

      if (action === "check") {
        if (!value) {
          throw new Error("theme check requires a built-in theme name or directory path.");
        }

        const result = await checkTheme(value);

        if (result.ok) {
          console.log(`Theme OK: ${result.themePath}`);
          return;
        }

        console.log(`Theme issues found in ${result.themePath}:`);
        for (const issue of result.issues) {
          console.log(`- ${issue}`);
        }
        process.exitCode = 1;
        return;
      }

      throw new Error(`Unknown theme action: ${action}`);
    });
  });

cli
  .command("init [target]", "Create a starter resume.md")
  .option("--force", "Overwrite existing resume.md")
  .action(async (target = ".", options) => {
    await runCommand(async () => {
      const resumePath = await initResume(path.resolve(target), Boolean(options.force));
      console.log(`Created starter resume: ${resumePath}`);
    });
  });

cli.help();
cli.version(APP_VERSION);
cli.parse();
