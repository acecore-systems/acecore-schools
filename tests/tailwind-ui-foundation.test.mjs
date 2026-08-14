import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(repositoryRoot, "src");

async function listAstroFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) return listAstroFiles(fullPath);
      return entry.name.endsWith(".astro") ? [fullPath] : [];
    }),
  );

  return nested.flat();
}

test("Tailwind v4 is the only public UI styling pipeline", async () => {
  const [packageJson, astroConfig, stylesheet, astroFiles] = await Promise.all([
    readFile(join(repositoryRoot, "package.json"), "utf8"),
    readFile(join(repositoryRoot, "astro.config.mjs"), "utf8"),
    readFile(join(sourceRoot, "styles", "tailwind.css"), "utf8"),
    listAstroFiles(sourceRoot),
  ]);

  assert.ok(packageJson.includes('"tailwindcss": "^4.'));
  assert.ok(packageJson.includes('"@tailwindcss/vite": "^4.'));
  assert.ok(
    astroConfig.includes('import tailwindcss from "@tailwindcss/vite";'),
  );
  assert.ok(astroConfig.includes("plugins: [tailwindcss()]"));
  assert.ok(stylesheet.includes('@import "tailwindcss";'));
  assert.ok(stylesheet.includes("@theme {"));
  assert.ok(stylesheet.includes("--color-navy:"));
  assert.ok(stylesheet.includes("--font-sans:"));
  assert.ok(stylesheet.includes("--shadow-focus:"));
  assert.ok(stylesheet.includes("--radius-control:"));
  assert.ok(stylesheet.includes("--spacing-control-x:"));
  assert.ok(stylesheet.includes("--ease-interaction:"));
  for (const legacyToken of [
    "paper",
    "canvas",
    "canvas-blue",
    "ink",
    "navy",
    "navy-dark",
    "green",
    "green-dark",
    "muted",
    "line",
    "line-strong",
    "shadow",
    "sans",
    "serif",
  ]) {
    assert.ok(!stylesheet.includes(`var(--${legacyToken})`));
  }

  const componentStyles = await Promise.all(
    astroFiles.map(async (path) => ({
      path: relative(repositoryRoot, path),
      content: await readFile(path, "utf8"),
    })),
  );

  for (const component of componentStyles) {
    assert.doesNotMatch(
      component.content,
      /<style(?:\s|>)/u,
      component.path + " must use the shared Tailwind entry point",
    );
  }
});
