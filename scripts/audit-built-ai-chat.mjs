import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const DIST_DIRECTORY = path.resolve("dist");
const API_ENDPOINT = "https://acecore.net/api/ai-contact";

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listHtmlFiles(filePath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(filePath);
    }
  }

  return files;
}

const htmlFiles = await listHtmlFiles(DIST_DIRECTORY);
const failures = [];
let auditedPages = 0;

for (const filePath of htmlFiles) {
  const relativePath = path
    .relative(DIST_DIRECTORY, filePath)
    .split(path.sep)
    .join("/");
  if (relativePath === "404.html") continue;

  auditedPages += 1;
  const html = await readFile(filePath, "utf8");
  const widgets = html.match(/\sdata-schools-ai-chat(?:\s|>)/gu) || [];

  if (widgets.length !== 1) {
    failures.push(`${relativePath}: expected exactly one AI chat widget`);
  }
  if (!html.includes(`data-endpoint="${API_ENDPOINT}"`)) {
    failures.push(`${relativePath}: shared AI API endpoint is missing`);
  }
  if (
    !html.includes('id="schools-ai-chat-panel"') ||
    !html.includes('role="dialog"') ||
    !html.includes('aria-modal="false"')
  ) {
    failures.push(`${relativePath}: accessible AI chat dialog is missing`);
  }
  if (
    !html.includes("data-schools-ai-chat-messages") ||
    !html.includes('role="log"') ||
    !html.includes('maxlength="800"')
  ) {
    failures.push(`${relativePath}: message log or input limit is missing`);
  }
}

if (auditedPages === 0) {
  failures.push("No Schools pages were found in dist");
}

if (failures.length > 0) {
  throw new Error(`AI chat audit failed:\n- ${failures.join("\n- ")}`);
}

console.log(
  JSON.stringify({
    auditedPages,
    endpoint: API_ENDPOINT,
    failures,
  }),
);
