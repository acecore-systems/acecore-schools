import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const siteUrl = new URL("https://schools.acecore.net");

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

function attributeValue(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "i",
    ),
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function decodeHtml(value) {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|quot|apos|lt|gt));/gi,
    (_, decimal, hexadecimal, named) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hexadecimal)
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" }[
        named.toLowerCase()
      ];
    },
  );
}

function routeForHtml(file) {
  const relative = path.relative(distDir, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"index.html".length)}`;
  }
  return `/${relative}`;
}

function targetCandidates(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  if (decodedPath === "/") return [path.join(distDir, "index.html")];

  const relativePath = decodedPath.replace(/^\/+/, "");
  if (decodedPath.endsWith("/")) {
    return [path.resolve(distDir, relativePath, "index.html")];
  }

  const extension = path.posix.extname(decodedPath);
  if (extension && extension !== ".html") return [];
  if (extension === ".html") {
    return [path.resolve(distDir, relativePath)];
  }

  return [
    path.resolve(distDir, relativePath, "index.html"),
    path.resolve(distDir, `${relativePath}.html`),
  ];
}

const htmlFiles = await listHtmlFiles(distDir);
if (htmlFiles.length === 0) {
  throw new Error(`No built HTML files found in ${distDir}`);
}

const failures = [];
let linksChecked = 0;
const documents = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const source = path.relative(distDir, file).replaceAll("\\", "/");
  const route = routeForHtml(file);
  const tags = html.match(/<[^>]+>/g) ?? [];
  const idValues = tags
    .map((tag) => attributeValue(tag, "id"))
    .filter((id) => id !== null)
    .map(decodeHtml);
  const ids = new Set(idValues);

  if (ids.size !== idValues.length) {
    const duplicates = [
      ...new Set(
        idValues.filter((id, index) => idValues.indexOf(id) !== index),
      ),
    ];
    failures.push(`${source}: duplicate id (${duplicates.join(", ")})`);
  }

  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1Count !== 1) {
    failures.push(`${source}: expected 1 h1, found ${h1Count}`);
  }

  if (route !== "/404.html") {
    const canonicalTags = tags.filter(
      (tag) =>
        /^<link\b/i.test(tag) &&
        (attributeValue(tag, "rel") ?? "")
          .toLowerCase()
          .split(/\s+/)
          .includes("canonical"),
    );

    if (canonicalTags.length !== 1) {
      failures.push(
        `${source}: expected 1 canonical, found ${canonicalTags.length}`,
      );
    } else {
      const canonicalHref = decodeHtml(
        attributeValue(canonicalTags[0], "href") ?? "",
      );
      const expectedCanonical = new URL(route, siteUrl).href;
      if (canonicalHref !== expectedCanonical) {
        failures.push(
          `${source}: canonical mismatch (${canonicalHref} != ${expectedCanonical})`,
        );
      }
    }
  }

  documents.set(path.resolve(file), { html, ids });
}

const distPrefix = `${distDir}${path.sep}`.toLowerCase();

for (const [file, document] of documents) {
  const source = path.relative(distDir, file).replaceAll("\\", "/");
  const pageUrl = new URL(routeForHtml(file), siteUrl);
  const anchors = document.html.match(/<a\b[^>]*>/gi) ?? [];

  for (const anchor of anchors) {
    const rawHref = attributeValue(anchor, "href");
    if (rawHref === null) continue;

    const href = decodeHtml(rawHref).trim();
    if (href === "") {
      failures.push(`${source}: empty href`);
      continue;
    }

    if (/^(?:mailto|tel|javascript):/i.test(href)) {
      continue;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, pageUrl);
    } catch {
      failures.push(`${source}: invalid href (${href})`);
      continue;
    }

    if (
      !["http:", "https:"].includes(targetUrl.protocol) ||
      targetUrl.origin !== siteUrl.origin
    ) {
      continue;
    }

    linksChecked += 1;

    let candidates;
    try {
      candidates = targetCandidates(targetUrl.pathname);
    } catch {
      failures.push(`${source}: invalid path (${href})`);
      continue;
    }

    if (candidates.length === 0) continue;
    if (
      candidates.some(
        (candidate) =>
          candidate.toLowerCase() !== distDir.toLowerCase() &&
          !candidate.toLowerCase().startsWith(distPrefix),
      )
    ) {
      failures.push(`${source}: path escapes dist (${href})`);
      continue;
    }

    const target = candidates.find((candidate) => documents.has(candidate));
    if (!target) {
      failures.push(
        `${source}: missing page (${href} -> ${targetUrl.pathname})`,
      );
      continue;
    }

    if (targetUrl.hash) {
      let fragment;
      try {
        fragment = decodeURIComponent(targetUrl.hash.slice(1));
      } catch {
        failures.push(`${source}: invalid fragment (${href})`);
        continue;
      }
      if (!documents.get(target).ids.has(fragment)) {
        failures.push(`${source}: missing fragment (${href})`);
      }
    }
  }
}

console.log(
  JSON.stringify({
    htmlFiles: htmlFiles.length,
    linksChecked,
    failures,
  }),
);

if (failures.length > 0) process.exitCode = 1;
