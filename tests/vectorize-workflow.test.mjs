import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const workflowUrl = new URL(
  "../.github/workflows/sync-vectorize.yml",
  import.meta.url,
);
const wranglerUrl = new URL("../wrangler.jsonc", import.meta.url);
const syncScriptUrl = new URL("../scripts/sync-vectorize.mjs", import.meta.url);

test("Production同期はpush・schedule・manualで公開中のcommitだけを対象にする", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const buildJob = workflow.slice(
    workflow.indexOf("  build-production-corpus:"),
    workflow.indexOf("\n  sync-production:"),
  );
  const productionJob = workflow.slice(workflow.indexOf("  sync-production:"));

  assert.match(workflow, /push:\s+branches:\s+- main/u);
  assert.match(workflow, /schedule:\s+- cron: "17 \*\/6 \* \* \*"/u);
  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /vars\.SCHOOLS_VECTORIZE_SYNC_ENABLED == 'true'/u);
  assert.match(
    workflow,
    /PRODUCTION_BUILD_MARKER_URL: https:\/\/schools\.acecore\.net\/\.well-known\/acecore-schools-build\.json/u,
  );
  assert.match(
    buildJob,
    /name: Check out the exact event tooling[\s\S]*?ref: \$\{\{ github\.sha \}\}/u,
  );
  assert.match(
    buildJob,
    /name: Check out the deployed site source[\s\S]*?ref: \$\{\{ steps\.site\.outputs\.commit \}\}/u,
  );
  assert.match(
    buildJob,
    /COMMIT_SHA: \$\{\{ steps\.site\.outputs\.commit \}\}/u,
  );
  assert.equal(workflow.match(/--assert-current/g)?.length, 3);
  assert.equal(
    productionJob.match(/verifier\/scripts\/wait-for-deployment\.mjs/g)?.length,
    2,
  );
  assert.match(productionJob, /--confirm-production "\$CORPUS_VERSION"/u);
  assert.match(
    productionJob,
    /CLOUDFLARE_SCHOOLS_SEARCH_PRODUCTION_API_TOKEN/u,
  );
});

test("mutation後の公開identity確認が成功証跡より先にある", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const productionJob = workflow.slice(workflow.indexOf("  sync-production:"));
  const mutation = productionJob.indexOf("Sync production Vectorize index");
  const finalIdentity = productionJob.indexOf(
    "Confirm the synced corpus is still public",
  );
  const evidence = productionJob.indexOf("Upload production sync evidence");

  assert.ok(mutation >= 0);
  assert.ok(finalIdentity > mutation);
  assert.ok(evidence > finalIdentity);
  assert.match(
    productionJob,
    /group: vectorize-schools-search-production\s+cancel-in-progress: false/u,
  );
  assert.match(productionJob, /needs:\s+- build-production-corpus/u);
  assert.doesNotMatch(productionJob, /working-directory: site/u);
  assert.match(productionJob, /node verifier\/scripts\/sync-vectorize\.mjs/u);
  assert.match(
    productionJob,
    /--receipt "\$RUNNER_TEMP\/vectorize-receipt\.json"/u,
  );
  assert.match(
    productionJob,
    /name: Upload production sync evidence\s+if: always\(\)/u,
  );
});

test("Preview同期もmoving mainではなくdispatch時のSHAへ固定する", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const previewJob = workflow.slice(
    workflow.indexOf("  sync-preview:"),
    workflow.indexOf("\n  build-production-corpus:"),
  );
  const productionJob = workflow.slice(workflow.indexOf("  sync-production:"));

  assert.match(
    previewJob,
    /name: Check out the exact dispatched main commit[\s\S]*?ref: \$\{\{ github\.sha \}\}/u,
  );
  assert.match(previewJob, /Preview sync only accepts current main\./u);
  assert.match(previewJob, /CLOUDFLARE_SCHOOLS_SEARCH_PREVIEW_API_TOKEN/u);
  assert.match(previewJob, /node verifier\/scripts\/sync-vectorize\.mjs/u);
  assert.doesNotMatch(workflow, /allow_large_delete/u);
  assert.match(
    workflow,
    /migration:\s+description: 初回v1→v2移行だけで使う限定モード[\s\S]*?- v1-to-v2/u,
  );
  assert.equal(workflow.match(/--migrate-v1-to-v2/g)?.length, 2);
  assert.match(
    productionJob,
    /if \[\[ "\$GITHUB_EVENT_NAME" != "workflow_dispatch" \]\]; then[\s\S]*?Migration mode is manual-only\./u,
  );
  assert.match(
    previewJob,
    /name: Upload preview sync evidence\s+if: always\(\)/u,
  );
});

test("Pages binding・sync allowlist・workflowのindex名を一致させる", async () => {
  const [workflow, wrangler, syncScript] = await Promise.all([
    readFile(workflowUrl, "utf8"),
    readFile(wranglerUrl, "utf8"),
    readFile(syncScriptUrl, "utf8"),
  ]);

  for (const indexName of [
    "acecore-schools-search-preview",
    "acecore-schools-search-production",
  ]) {
    assert.match(workflow, new RegExp(indexName, "u"));
    assert.match(wrangler, new RegExp(indexName, "u"));
    assert.match(syncScript, new RegExp(indexName, "u"));
  }
});
