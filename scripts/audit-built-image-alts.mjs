import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(absolutePath);
      return entry.isFile() && entry.name.endsWith(".html")
        ? [absolutePath]
        : [];
    }),
  );
  return files.flat();
}

const htmlFiles = await listHtmlFiles(distDir);
if (htmlFiles.length === 0) {
  throw new Error(`No built HTML files found in ${distDir}`);
}

const failures = [];
let imageCount = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  imageCount += images.length;

  for (const image of images) {
    const alt = image.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const src =
      image.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i) ?? [];
    const relativeFile = path.relative(distDir, file).replaceAll("\\", "/");
    const imageSource = src[1] ?? src[2] ?? src[3] ?? "unknown source";

    if (!alt) {
      failures.push(`${relativeFile}: missing alt (${imageSource})`);
      continue;
    }

    const altText = alt[1] ?? alt[2] ?? alt[3] ?? "";
    if (altText.trim() === "") {
      failures.push(`${relativeFile}: empty alt (${imageSource})`);
    }
  }
}

console.log(
  JSON.stringify({ htmlFiles: htmlFiles.length, images: imageCount, failures }),
);

if (failures.length > 0) process.exitCode = 1;
