"use strict";

const DEFAULT_TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || "120000", 10);
const url = process.env.TARGET_URL;
const method = (process.env.METHOD || "GET").toUpperCase();

if (!url) {
  console.error("ERROR: TARGET_URL env var is required.");
  process.exit(1);
}

async function main() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, { method, signal: controller.signal });
    const ms = Date.now() - start;
    if (!res.ok) {
      const body = await safeText(res);
      console.error(
        `Request failed: ${res.status} ${
          res.statusText
        } in ${ms}ms. Body: ${truncate(body, 500)}`
      );
      process.exit(1);
    }
    console.log(
      `OK: ${method} ${url} -> ${res.status} ${res.statusText} in ${ms}ms`
    );
  } catch (err) {
    const ms = Date.now() - start;
    if (err && err.name === "AbortError") {
      console.error(
        `Timeout after ${DEFAULT_TIMEOUT_MS}ms for ${method} ${url}`
      );
    } else {
      console.error(
        `Error after ${ms}ms:`,
        err && err.message ? err.message : err
      );
    }
    process.exit(1);
  } finally {
    clearTimeout(timeout);
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

main();
