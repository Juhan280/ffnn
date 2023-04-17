import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/index.ts"],
	outDir: "./public",
	format: "esm",
	platform: "browser",
});
