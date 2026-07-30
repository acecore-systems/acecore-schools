import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const SEARCH_CORPUS_SCHEMA_VERSION = 1;
export const SEARCH_EMBEDDING_MODEL = "@cf/baai/bge-m3";
export const SEARCH_EMBEDDING_DIMENSIONS = 1024;
export const SEARCH_DISTANCE_METRIC = "cosine";
export const SEARCH_MIN_SOURCE_COUNT = 6;
export const SEARCH_MIN_VECTOR_COUNT = 6;
export const SEARCH_VECTOR_LIMIT = 500;
export const SEARCH_MAX_CHUNK_LENGTH = 1200;
export const SEARCH_NAMESPACE = "ja";
export const SEARCH_REQUIRED_SOURCE_PATHS = Object.freeze([
  "/",
  "/learning/",
  "/how-it-works/",
  "/pricing/",
  "/about/",
  "/faq/",
]);

const SITE_ORIGIN = "https://schools.acecore.net";
const DEFAULT_DIST_DIR = resolve("dist");
const DEFAULT_OUTPUT_FILE = resolve(".vectorize/corpus.json");
const TARGET_CHUNK_LENGTH = 850;
const OVERLAP_LENGTH = 120;
const MIN_BLOCK_LENGTH = 12;
const MANAGED_VECTOR_ID_PREFIX = "schools-v1-";

const CONTENT_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "p",
  "li",
  "blockquote",
  "pre",
  "dt",
  "dd",
]);
const HEADING_TAGS = new Set(["h1", "h2", "h3"]);
const SKIPPED_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "form",
  "button",
  "nav",
  "aside",
  "footer",
]);
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export async function buildSearchCorpus({
  distDir = DEFAULT_DIST_DIR,
  outputFile = DEFAULT_OUTPUT_FILE,
  write = true,
} = {}) {
  const htmlFiles = await findHtmlFiles(distDir);
  const documents = [];

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const document = extractSearchDocument(html, htmlFile, distDir);
    if (document) documents.push(document);
  }

  documents.sort((a, b) => a.url.localeCompare(b.url));
  assertRequiredSources(documents);

  const chunks = documents.flatMap((document) => chunkSearchDocument(document));
  if (chunks.length < SEARCH_MIN_VECTOR_COUNT) {
    throw new Error(
      `Search corpus must contain at least ${SEARCH_MIN_VECTOR_COUNT} vectors; found ${chunks.length}.`,
    );
  }
  if (chunks.length > SEARCH_VECTOR_LIMIT) {
    throw new Error(
      `Search corpus has ${chunks.length} vectors; the operational limit is ${SEARCH_VECTOR_LIMIT}.`,
    );
  }

  const sourceUrls = documents.map(({ url }) => url);
  const version = digest(
    chunks
      .map(({ id }) => id)
      .sort()
      .join("\n"),
  ).slice(0, 20);
  const corpus = {
    schemaVersion: SEARCH_CORPUS_SCHEMA_VERSION,
    version,
    embedding: {
      model: SEARCH_EMBEDDING_MODEL,
      dimensions: SEARCH_EMBEDDING_DIMENSIONS,
      metric: SEARCH_DISTANCE_METRIC,
    },
    chunking: {
      targetCharacters: TARGET_CHUNK_LENGTH,
      maximumCharacters: SEARCH_MAX_CHUNK_LENGTH,
      overlapCharacters: OVERLAP_LENGTH,
    },
    sourceCount: documents.length,
    sourceUrls,
    vectorCount: chunks.length,
    localeCounts: {
      [SEARCH_NAMESPACE]: chunks.length,
    },
    chunks,
  };

  if (write) {
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, `${JSON.stringify(corpus, null, 2)}\n`, "utf8");
  }

  return corpus;
}

export function extractSearchDocument(html, htmlFile, distDir) {
  const fallbackPath = htmlFileToUrl(htmlFile, distDir);
  const canonicalPath = getCanonicalPath(html, fallbackPath);

  if (shouldExcludePath(canonicalPath) || isNoIndexPage(html)) return null;

  const extracted = collectContentBlocks(html);
  const title = normalizeText(
    extracted.firstHeading ||
      getMetaContent(html, "property", "og:title") ||
      getElementText(html, "title"),
  ).replace(/\s+[|｜]\s+Acecore Schools$/iu, "");
  if (!title) return null;

  const blocks = extracted.blocks.map((block) => ({
    heading: block.heading || title,
    text: block.text,
  }));
  if (blocks.reduce((total, block) => total + block.text.length, 0) < 50) {
    return null;
  }

  return {
    url: canonicalPath,
    locale: SEARCH_NAMESPACE,
    title,
    description: normalizeText(
      getMetaContent(html, "name", "description") || "",
    ),
    contentType: canonicalPath === "/" ? "home" : "page",
    blocks,
  };
}

export function chunkSearchDocument(document) {
  const groups = [];
  let current = [];
  let currentLength = 0;

  for (const block of document.blocks) {
    const blockLimit = Math.max(
      400,
      SEARCH_MAX_CHUNK_LENGTH -
        document.title.length -
        block.heading.length -
        3,
    );
    for (const part of splitLongText(block.text, blockLimit)) {
      const next = { heading: block.heading, text: part };
      let separatorLength = current.length > 0 ? 1 : 0;
      const wouldExceed =
        current.length > 0 &&
        (currentLength + separatorLength + part.length > TARGET_CHUNK_LENGTH ||
          composeChunkText(document, [...current, next]).length >
            SEARCH_MAX_CHUNK_LENGTH);

      if (wouldExceed) {
        groups.push(current);
        current = buildOverlap(current);
        if (
          composeChunkText(document, [...current, next]).length >
          SEARCH_MAX_CHUNK_LENGTH
        ) {
          current = [];
        }
        currentLength = current.reduce(
          (total, item, index) =>
            total + item.text.length + (index > 0 ? 1 : 0),
          0,
        );
        separatorLength = current.length > 0 ? 1 : 0;
      }

      current.push(next);
      currentLength += separatorLength + part.length;
    }
  }

  if (current.length > 0) groups.push(current);

  return groups.map((group, index) => {
    const section =
      [...group].reverse().find(({ heading }) => heading)?.heading ||
      document.title;
    const body = group.map(({ text }) => text).join("\n");
    const text = composeChunkText(document, group);
    if (text.length > SEARCH_MAX_CHUNK_LENGTH) {
      throw new Error(
        `Search chunk exceeds ${SEARCH_MAX_CHUNK_LENGTH} characters: ${document.url}`,
      );
    }
    const id = `${MANAGED_VECTOR_ID_PREFIX}${digest(
      [document.locale, document.url, String(index), text].join("\n"),
    ).slice(0, 48)}`;

    return {
      id,
      namespace: SEARCH_NAMESPACE,
      text,
      metadata: {
        url: document.url,
        title: document.title,
        section,
        excerpt: createExcerpt(body || document.description),
        contentType: document.contentType,
        locale: SEARCH_NAMESPACE,
      },
    };
  });
}

function assertRequiredSources(documents) {
  const sourceUrls = new Set(documents.map(({ url }) => url));
  const missing = SEARCH_REQUIRED_SOURCE_PATHS.filter(
    (url) => !sourceUrls.has(url),
  );
  if (
    documents.length < SEARCH_MIN_SOURCE_COUNT ||
    missing.length > 0 ||
    sourceUrls.size !== documents.length
  ) {
    throw new Error(
      `Search corpus sources are incomplete or duplicated. Missing: ${
        missing.join(", ") || "none"
      }; found ${documents.length} documents and ${sourceUrls.size} unique URLs.`,
    );
  }
}

function composeChunkText(document, group) {
  const section =
    [...group].reverse().find(({ heading }) => heading)?.heading ||
    document.title;
  const body = group.map(({ text }) => text).join("\n");
  return normalizeText(
    [document.title, section !== document.title ? section : "", body]
      .filter(Boolean)
      .join("\n"),
  );
}

function collectContentBlocks(html) {
  const stack = [];
  const blocks = [];
  let insideMain = false;
  let mainDepth = 0;
  let currentHeading = "";
  let firstHeading = "";
  let previousText = "";

  const finalizeFrame = (frame) => {
    if (!frame.target || frame.skip || !insideMain) return;
    const text = normalizeText(frame.textParts.join(" "));
    if (!text || text === previousText) return;
    previousText = text;

    if (HEADING_TAGS.has(frame.tag)) {
      currentHeading = text;
      if (!firstHeading) firstHeading = text;
      return;
    }
    if (text.length >= MIN_BLOCK_LENGTH) {
      blocks.push({ heading: currentHeading, text });
    }
  };

  for (const token of tokenizeHtml(html)) {
    if (token.kind === "text") {
      if (!insideMain || stack.some(({ skip }) => skip)) continue;
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].target) {
          stack[index].textParts.push(decodeHtmlEntities(token.value));
          break;
        }
      }
      continue;
    }

    const parsed = parseTag(token.value);
    if (!parsed) continue;
    const { closing, tag, attributes, selfClosing } = parsed;

    if (closing) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const frame = stack.pop();
        if (!frame) break;
        finalizeFrame(frame);
        if (frame.tag === "main") {
          mainDepth -= 1;
          if (mainDepth <= 0) {
            insideMain = false;
            mainDepth = 0;
          }
        }
        if (frame.tag === tag) break;
      }
      continue;
    }

    const parentSkipped = stack.some(({ skip }) => skip);
    const frame = {
      tag,
      skip:
        parentSkipped ||
        SKIPPED_TAGS.has(tag) ||
        hasClass(attributes, "consultation") ||
        hasAttribute(attributes, "data-pagefind-ignore") ||
        hasAttribute(attributes, "data-search-ignore") ||
        getAttribute(attributes, "aria-hidden")?.toLowerCase() === "true",
      target: CONTENT_TAGS.has(tag),
      textParts: [],
    };
    stack.push(frame);
    if (tag === "main") {
      mainDepth += 1;
      insideMain = true;
    }

    if (selfClosing || VOID_TAGS.has(tag)) {
      stack.pop();
      finalizeFrame(frame);
    }
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame) finalizeFrame(frame);
  }

  return { blocks, firstHeading };
}

function* tokenizeHtml(html) {
  let index = 0;
  while (index < html.length) {
    if (html[index] !== "<") {
      const nextTag = html.indexOf("<", index);
      const end = nextTag === -1 ? html.length : nextTag;
      yield { kind: "text", value: html.slice(index, end) };
      index = end;
      continue;
    }

    if (html.startsWith("<!--", index)) {
      const commentEnd = html.indexOf("-->", index + 4);
      index = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    let quote = "";
    let end = index + 1;
    for (; end < html.length; end += 1) {
      const character = html[end];
      if (quote) {
        if (character === quote) quote = "";
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === ">") {
        break;
      }
    }
    if (end >= html.length) {
      yield { kind: "text", value: html.slice(index) };
      break;
    }
    yield { kind: "tag", value: html.slice(index, end + 1) };
    index = end + 1;
  }
}

function parseTag(value) {
  if (/^<\s*[!?]/u.test(value)) return null;
  const match = value.match(
    /^<\s*(\/?)\s*([A-Za-z][\w:-]*)([\s\S]*?)(\/?)\s*>$/u,
  );
  if (!match) return null;
  return {
    closing: match[1] === "/",
    tag: match[2].toLowerCase(),
    attributes: match[3] || "",
    selfClosing: match[4] === "/",
  };
}

function getAttribute(attributes, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = attributes.match(
    new RegExp(
      `(?:^|\\s)${escapedName}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+)))?`,
      "iu",
    ),
  );
  if (!match) return null;
  return decodeHtmlEntities(match[1] ?? match[2] ?? match[3] ?? "");
}

function hasAttribute(attributes, name) {
  return getAttribute(attributes, name) !== null;
}

function hasClass(attributes, className) {
  return (getAttribute(attributes, "class") || "")
    .split(/\s+/u)
    .includes(className);
}

function getCanonicalPath(html, fallbackPath) {
  for (const match of html.matchAll(/<link\b([^>]*)>/giu)) {
    const attributes = match[1];
    const rel = getAttribute(attributes, "rel") || "";
    if (
      !rel.split(/\s+/u).some((value) => value.toLowerCase() === "canonical")
    ) {
      continue;
    }
    const href = getAttribute(attributes, "href");
    if (!href) return fallbackPath;
    try {
      const url = new URL(href, SITE_ORIGIN);
      if (url.origin !== SITE_ORIGIN) return fallbackPath;
      return normalizeUrlPath(url.pathname);
    } catch {
      return fallbackPath;
    }
  }
  return fallbackPath;
}

function getMetaContent(html, attributeName, expectedValue) {
  for (const match of html.matchAll(/<meta\b([^>]*)>/giu)) {
    const attributes = match[1];
    const value = getAttribute(attributes, attributeName);
    if (value?.toLowerCase() !== expectedValue.toLowerCase()) continue;
    return getAttribute(attributes, "content") || "";
  }
  return "";
}

function getElementText(html, tagName) {
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = html.match(
    new RegExp(
      `<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}\\s*>`,
      "iu",
    ),
  );
  if (!match) return "";
  return decodeHtmlEntities(match[1].replace(/<[^>]*>/gu, " "));
}

function isNoIndexPage(html) {
  const robots = getMetaContent(html, "name", "robots");
  return robots
    .toLowerCase()
    .split(",")
    .some((value) => value.trim() === "noindex");
}

function splitLongText(text, limit) {
  if (text.length <= limit) return [text];

  const sentences = text.split(/(?<=[。！？.!?])\s*/u).filter(Boolean);
  const parts = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > limit) {
      if (current) {
        parts.push(current);
        current = "";
      }
      for (let index = 0; index < sentence.length; index += limit) {
        parts.push(sentence.slice(index, index + limit));
      }
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > limit) {
      parts.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) parts.push(current);
  return parts;
}

function buildOverlap(blocks) {
  const overlap = [];
  let length = 0;

  for (const block of [...blocks].reverse()) {
    if (overlap.length > 0 && length + block.text.length > OVERLAP_LENGTH)
      break;
    overlap.unshift(block);
    length += block.text.length;
    if (length >= OVERLAP_LENGTH) break;
  }

  return overlap;
}

function createExcerpt(text) {
  const normalized = normalizeText(text);
  if (normalized.length <= 220) return normalized;
  return `${normalized.slice(0, 219).trimEnd()}…`;
}

function shouldExcludePath(path) {
  return path === "/404/" || path === "/404.html/";
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(path);
      return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
    }),
  );
  return files.flat();
}

function htmlFileToUrl(htmlFile, distDir) {
  const path = relative(distDir, htmlFile).split(sep).join("/");
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) {
    return normalizeUrlPath(`/${path.slice(0, -"index.html".length)}`);
  }
  return normalizeUrlPath(`/${path}`);
}

function normalizeUrlPath(path) {
  const normalized = `/${path}`.replace(/\/+/gu, "/");
  if (normalized === "/") return normalized;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function decodeHtmlEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return String(value || "").replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]+));/giu,
    (entity, decimal, hexadecimal, name) => {
      if (decimal) {
        const codePoint = Number(decimal);
        return Number.isSafeInteger(codePoint) &&
          codePoint >= 0 &&
          codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity;
      }
      if (hexadecimal) {
        const codePoint = Number.parseInt(hexadecimal, 16);
        return Number.isSafeInteger(codePoint) &&
          codePoint >= 0 &&
          codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity;
      }
      return named[name.toLowerCase()] ?? entity;
    },
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/gu, " ")
    .trim();
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return (
    resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  const corpus = await buildSearchCorpus();
  console.log(
    JSON.stringify({
      event: "search_corpus_built",
      version: corpus.version,
      sources: corpus.sourceCount,
      vectors: corpus.vectorCount,
      locales: corpus.localeCounts,
    }),
  );
}
