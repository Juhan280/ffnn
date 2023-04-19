import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/index.ts"],
	outDir: "./docs",
	format: "esm",
	platform: "browser",
});
