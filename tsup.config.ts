import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: ["esm"],
  target: "node18",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  minify: true,
  bundle: true,
  onSuccess: async () => {
    const fs = await import("fs-extra");
    const path = await import("path");
    const templateSource = path.join(process.cwd(), "src", "templates");
    const templateTarget = path.join(process.cwd(), "dist", "templates");

    await fs.copy(templateSource, templateTarget);
    console.log("Templates copied to dist/");
  },
  shims: false,
  platform: "node",
  treeshake: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: [],
  external: ["handlebars"],
});
