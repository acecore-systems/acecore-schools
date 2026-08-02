import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const OFFICIAL_EVENT_STATUS_TYPES = new Set([
  "https://schema.org/EventCancelled",
  "https://schema.org/EventMovedOnline",
  "https://schema.org/EventPostponed",
  "https://schema.org/EventRescheduled",
  "https://schema.org/EventScheduled",
]);
export const WORKSHOP_ACTIVITY_OUTPUT =
  "activities/2023-summer-robot-workshop/index.html";
export const WORKSHOP_EVENT_NODE_COUNT = 0;
export const WORKSHOP_ARTICLE_NODE_COUNT = 1;

export function validateWorkshopStructuredData(result) {
  if (!result) {
    return [`${WORKSHOP_ACTIVITY_OUTPUT}: built activity page is missing`];
  }

  const failures = [];
  if (result.eventNodes !== WORKSHOP_EVENT_NODE_COUNT) {
    failures.push(
      `${WORKSHOP_ACTIVITY_OUTPUT}: expected ${WORKSHOP_EVENT_NODE_COUNT} Event nodes for a past activity record, found ${result.eventNodes}`,
    );
  }

  if (result.articleNodes !== WORKSHOP_ARTICLE_NODE_COUNT) {
    failures.push(
      `${WORKSHOP_ACTIVITY_OUTPUT}: expected ${WORKSHOP_ARTICLE_NODE_COUNT} Article node, found ${result.articleNodes}`,
    );
  }

  return failures;
}

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

function attributeValue(attributes, name) {
  const match = attributes.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "i",
    ),
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function isEventType(type) {
  return type === "Event" || type === "https://schema.org/Event";
}

function isArticleType(type) {
  return type === "Article" || type === "https://schema.org/Article";
}

export function auditStructuredDataHtml(html, { source = "unknown" } = {}) {
  const failures = [];
  let structuredDataScripts = 0;
  let eventNodes = 0;
  let eventStatuses = 0;
  let articleNodes = 0;
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);

  for (const [index, script] of [...scripts].entries()) {
    const type = attributeValue(script[1], "type")?.toLowerCase();
    if (type !== "application/ld+json") continue;

    structuredDataScripts += 1;
    let structuredData;
    try {
      structuredData = JSON.parse(script[2]);
    } catch (error) {
      failures.push(
        `${source}: JSON-LD script ${index + 1} is invalid (${error.message})`,
      );
      continue;
    }

    function visit(value, jsonPath) {
      if (Array.isArray(value)) {
        value.forEach((item, itemIndex) =>
          visit(item, `${jsonPath}[${itemIndex}]`),
        );
        return;
      }
      if (value === null || typeof value !== "object") return;

      const types = Array.isArray(value["@type"])
        ? value["@type"]
        : [value["@type"]];
      if (types.some(isEventType)) {
        eventNodes += 1;
        if (Object.hasOwn(value, "eventStatus")) {
          eventStatuses += 1;
          const status = value.eventStatus;
          if (
            typeof status !== "string" ||
            !OFFICIAL_EVENT_STATUS_TYPES.has(status)
          ) {
            failures.push(
              `${source}: ${jsonPath}.eventStatus is not an official EventStatusType (${JSON.stringify(status)})`,
            );
          }
        }
      }

      if (types.some(isArticleType)) articleNodes += 1;

      for (const [key, child] of Object.entries(value)) {
        visit(child, `${jsonPath}.${key}`);
      }
    }

    visit(structuredData, `$[script:${index + 1}]`);
  }

  return {
    structuredDataScripts,
    eventNodes,
    eventStatuses,
    articleNodes,
    failures,
  };
}

export async function auditBuiltStructuredData({
  distDir = path.resolve("dist"),
} = {}) {
  const htmlFiles = await listHtmlFiles(distDir);
  if (htmlFiles.length === 0) {
    throw new Error(`No built HTML files found in ${distDir}`);
  }

  const totals = {
    htmlFiles: htmlFiles.length,
    structuredDataScripts: 0,
    eventNodes: 0,
    eventStatuses: 0,
    articleNodes: 0,
    failures: [],
  };
  const resultsBySource = new Map();

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const source = path.relative(distDir, file).replaceAll("\\", "/");
    const result = auditStructuredDataHtml(html, { source });
    resultsBySource.set(source, result);
    totals.structuredDataScripts += result.structuredDataScripts;
    totals.eventNodes += result.eventNodes;
    totals.eventStatuses += result.eventStatuses;
    totals.articleNodes += result.articleNodes;
    totals.failures.push(...result.failures);
  }
  totals.failures.push(
    ...validateWorkshopStructuredData(
      resultsBySource.get(WORKSHOP_ACTIVITY_OUTPUT),
    ),
  );

  return totals;
}

async function main() {
  const result = await auditBuiltStructuredData();
  console.log(JSON.stringify(result));
  if (result.failures.length > 0) process.exitCode = 1;
}

const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (entryFile === fileURLToPath(import.meta.url)) {
  await main();
}
