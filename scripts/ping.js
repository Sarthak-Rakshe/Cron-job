"use strict";

// Default timeout: 5 minutes (300000 ms) unless overridden via TIMEOUT_MS env var
const DEFAULT_TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || "300000", 10);
const url = process.env.TARGET_URL;
const method = (process.env.METHOD || "GET").toUpperCase();

if (!url) {
  console.error("ERROR: TARGET_URL env var is required.");
  process.exit(1);
}

async function main() {
  // Retries count is total attempts allowed; e.g. MAX_RETRIES=3 means up to 3 attempts total
  const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "2", 10);
  const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || "5000", 10);
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const start = Date.now();
    try {
      const res = await fetch(url, { method, signal: controller.signal });
      const ms = Date.now() - start;
      if (!res.ok) {
        const body = await safeText(res);
        console.error(
          `Attempt ${attempt}: Request failed: ${res.status} ${
            res.statusText
          } in ${ms}ms. Body: ${truncate(body, 500)}`
        );
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          continue;
        } else {
          process.exit(1);
        }
      }
      console.log(
        `OK: ${method} ${url} -> ${res.status} ${res.statusText} in ${ms}ms (attempt ${attempt})`
      );
      return;
    } catch (err) {
      const ms = Date.now() - start;
      if (err && err.name === "AbortError") {
        console.error(
          `Attempt ${attempt}: Timeout after ${DEFAULT_TIMEOUT_MS}ms for ${method} ${url}`
        );
      } else {
        console.error(
          `Attempt ${attempt}: Error after ${ms}ms:`,
          err && err.message ? err.message : err
        );
      }
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
        continue;
      } else {
        process.exit(1);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
main();
