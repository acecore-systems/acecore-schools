import { probeVoyageDocument } from "./sync-vectorize.mjs";

try {
  const result = await probeVoyageDocument();
  console.log(JSON.stringify(result));
} catch {
  console.error("Voyage document embedding verification failed.");
  process.exitCode = 1;
}
