import assert from "node:assert/strict";
import { test } from "node:test";

import { createBuildMetadata } from "../scripts/write-build-meta.mjs";
import {
  assertDeployedBuild,
  parseBuildMetadata,
  waitForDeployment,
} from "../scripts/wait-for-deployment.mjs";

const COMMIT = "a".repeat(40);
const CORPUS_VERSION = "b".repeat(20);
const CORPUS = {
  version: CORPUS_VERSION,
  sourceCount: 7,
  vectorCount: 7,
};
const MARKER_URL =
  "https://schools.acecore.net/.well-known/acecore-schools-build.json";

test("build markerにcommitとcorpus identityを固定する", () => {
  const marker = createBuildMetadata({
    commit: COMMIT.toUpperCase(),
    corpus: CORPUS,
  });

  assert.deepEqual(marker, {
    schemaVersion: 1,
    commit: COMMIT,
    searchCorpusVersion: CORPUS_VERSION,
    sourceCount: 7,
    vectorCount: 7,
  });
  assert.deepEqual(parseBuildMetadata(JSON.stringify(marker)), marker);
  assert.throws(
    () => parseBuildMetadata(JSON.stringify({ ...marker, vectorCount: 0 })),
    /positive vector count/u,
  );
});

test("公開commitとcorpus identityが一致した場合だけ同期を許可する", async () => {
  const fetchImpl = async () =>
    Response.json(
      createBuildMetadata({
        commit: COMMIT,
        corpus: CORPUS,
      }),
    );
  const silentLogger = { log() {} };

  await assert.doesNotReject(
    assertDeployedBuild(MARKER_URL, COMMIT, CORPUS, {
      fetchImpl,
      logger: silentLogger,
    }),
  );
  await assert.rejects(
    assertDeployedBuild(
      MARKER_URL,
      COMMIT,
      { ...CORPUS, vectorCount: 8 },
      {
        fetchImpl,
        logger: silentLogger,
      },
    ),
    /search corpus differs/u,
  );
});

test("一時エラーと旧commitを越えて対象deploymentを待つ", async () => {
  const responses = [
    new Response("temporarily unavailable", { status: 503 }),
    Response.json({
      ...createBuildMetadata({ commit: "c".repeat(40), corpus: CORPUS }),
    }),
    Response.json(createBuildMetadata({ commit: COMMIT, corpus: CORPUS })),
  ];

  const deployed = await waitForDeployment(MARKER_URL, COMMIT, {
    timeoutMs: 1_000,
    pollMs: 0,
    fetchImpl: async () => responses.shift(),
    sleepImpl: async () => {},
    logger: { log() {} },
  });

  assert.equal(responses.length, 0);
  assert.equal(deployed.commit, COMMIT);
  assert.equal(deployed.vectorCount, 7);
});

test("HTTP URLと過大markerを拒否する", async () => {
  assert.throws(
    () => parseBuildMetadata("x".repeat(4097)),
    /unexpectedly large/u,
  );
  await assert.rejects(
    assertDeployedBuild(
      "http://schools.acecore.net/build.json",
      COMMIT,
      CORPUS,
    ),
    /must use HTTPS/u,
  );
});
