import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const COMMIT_PATTERN = /^[0-9a-f]{40}$/iu;
const CORPUS_VERSION_PATTERN = /^[0-9a-f]{20}$/iu;
const DEFAULT_CORPUS_FILE = resolve(".vectorize/corpus.json");
const DEFAULT_OUTPUT_FILE = resolve(
  "dist/.well-known/acecore-schools-build.json",
);

export function createBuildMetadata({ commit, corpus }) {
  const normalizedCommit = normalizeCommit(commit);
  const searchCorpusVersion = String(corpus?.version || "")
    .trim()
    .toLowerCase();
  const sourceCount = corpus?.sourceCount;
  const vectorCount = corpus?.vectorCount;

  if (!CORPUS_VERSION_PATTERN.test(searchCorpusVersion)) {
    throw new Error(
      "Search corpus must contain a 20-character hexadecimal version.",
    );
  }
  if (!Number.isInteger(sourceCount) || sourceCount < 1) {
    throw new Error("Search corpus must contain a positive source count.");
  }
  if (!Number.isInteger(vectorCount) || vectorCount < 1) {
    throw new Error("Search corpus must contain a positive vector count.");
  }

  return {
    schemaVersion: 1,
    commit: normalizedCommit,
    searchCorpusVersion,
    sourceCount,
    vectorCount,
  };
}

export async function writeBuildMetadata({
  corpusFile = DEFAULT_CORPUS_FILE,
  outputFile = DEFAULT_OUTPUT_FILE,
  commit,
} = {}) {
  const corpus = JSON.parse(await readFile(corpusFile, "utf8"));
  const metadata = createBuildMetadata({
    commit: commit || (await resolveBuildCommit()),
    corpus,
  });

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(metadata)}\n`, "utf8");
  return metadata;
}

async function resolveBuildCommit() {
  if (process.env.CF_PAGES && !process.env.CF_PAGES_COMMIT_SHA) {
    throw new Error(
      "Cloudflare Pages build metadata requires CF_PAGES_COMMIT_SHA.",
    );
  }

  const configuredCommit =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.GITHUB_SHA;
  if (configuredCommit) return normalizeCommit(configuredCommit);

  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  return normalizeCommit(stdout);
}

function normalizeCommit(value) {
  const commit = String(value || "")
    .trim()
    .toLowerCase();
  if (!COMMIT_PATTERN.test(commit)) {
    throw new Error("Build metadata requires a full 40-character Git SHA.");
  }
  return commit;
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return (
    resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  const metadata = await writeBuildMetadata();
  console.log(JSON.stringify({ event: "build_metadata_written", ...metadata }));
}
