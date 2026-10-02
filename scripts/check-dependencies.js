#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const declared = { ...pkg.dependencies, ...pkg.devDependencies };
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.m?js$/.test(path) ? [path] : [];
  });
}
const sources = ['src', 'scripts'].flatMap(directory => files(join(root, directory)));
for (const file of sources) {
  const source = readFileSync(file, 'utf8');
  // Check literal imports used by these small Node entry points, including dynamic imports.
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g)) {
    const name = match[1];
    if (name.startsWith('.')) {
      assert.ok(existsSync(resolve(dirname(file), name)), `Missing local import: ${file}: ${name}`);
    } else if (!isBuiltin(name)) {
      const packageName = name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0];
      assert.ok(declared[packageName], `Undeclared dependency: ${file}: ${name}`);
    }
  }
}
console.log(`Dependency declarations and local imports checked in ${sources.length} Node source files.`);
