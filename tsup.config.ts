import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli/index.ts"
  },
  format: ["esm"],
  platform: "node",
  target: "node20",
  clean: true,
  sourcemap: true,
  dts: false,
  splitting: false,
  outDir: "dist",
  outExtension() {
    return {
      js: ".js"
    };
  },
  banner: {
    js: "#!/usr/bin/env node"
  }
});
