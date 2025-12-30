#!/usr/bin/env node

/**
 * Post-build script to fix Cloudflare Workers compatibility issues
 * Fixes async_hooks imports that are incorrectly bundled
 */

const fs = require("fs");
const path = require("path");

const workerDir = path.join(process.cwd(), ".vercel/output/static/_worker.js");

function fixAsyncHooksImports(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Fix 1: Replace import*as no from"async_hooks" with proper handling
  const asyncHooksPattern1 =
    /import\s*\*\s*as\s+(\w+)\s+from\s*['"]async_hooks['"];?/g;
  if (asyncHooksPattern1.test(content)) {
    console.log(`Fixing async_hooks import (pattern 1) in ${filePath}`);
    content = content.replace(
      asyncHooksPattern1,
      "const $1 = { AsyncLocalStorage: class { getStore() { return undefined; } } };",
    );
    modified = true;
  }

  // Fix 2: Replace import('node:async_hooks') with a mock
  const asyncHooksPattern2 =
    /import\('node:async_hooks'\)\.then\(\(\{\s*AsyncLocalStorage\s*\}\)\s*=>\s*\{[\s\S]*?\}\)/g;
  if (asyncHooksPattern2.test(content)) {
    console.log(`Fixing node:async_hooks import (pattern 2) in ${filePath}`);

    // This is the problematic code in index.js that needs to be replaced
    content = content.replace(
      asyncHooksPattern2,
      `Promise.resolve({
        AsyncLocalStorage: class {
          constructor() {}
          getStore() { return undefined; }
          run(store, callback) { return callback(); }
          exit(callback) { return callback?.(); }
        }
      }).then(({ AsyncLocalStorage }) => {
        globalThis.AsyncLocalStorage = AsyncLocalStorage;
        const envAsyncLocalStorage = new AsyncLocalStorage();
        const requestContextAsyncLocalStorage = new AsyncLocalStorage();
        globalThis.process = {
          env: new Proxy({}, {
            ownKeys: () => [],
            getOwnPropertyDescriptor: () => undefined,
            get: () => undefined,
            set: () => false,
          }),
        };
        globalThis[Symbol.for('__cloudflare-request-context__')] = new Proxy({}, {
          ownKeys: () => [],
          getOwnPropertyDescriptor: () => undefined,
          get: () => undefined,
          set: () => false,
        });
        return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
      })`,
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith(".js") || file.endsWith(".mjs")) {
      callback(filePath);
    }
  }
}

console.log("Fixing async_hooks imports in worker code...");
let fixedCount = 0;
walkDir(workerDir, (filePath) => {
  if (fixAsyncHooksImports(filePath)) {
    fixedCount++;
  }
});
console.log(`Fixed ${fixedCount} files`);
