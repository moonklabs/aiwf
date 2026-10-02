#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { supportedStacks } from './install-spec-skills.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(path, 'utf8');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const market = JSON.parse(read(join(root, '.claude-plugin/marketplace.json')));
const pkg = JSON.parse(read(join(root, 'package.json')));
let verified = 0;
let modified = 0;
let skills = 0;
let importedSkills = 0;
let commit;

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

for (const name of ['aiwf-spec', ...supportedStacks.map(stack => `aiwf-${stack}`)]) {
  const plugin = join(root, 'plugins', name);
  const provenance = JSON.parse(read(join(plugin, 'UPSTREAM.json')));
  assert.equal(provenance.repository, 'https://github.com/AI-Unified-Process/marketplace');
  assert.match(provenance.commit, /^[0-9a-f]{40}$/);
  commit ??= provenance.commit;
  assert.equal(provenance.commit, commit, `Mixed upstream versions: ${name}`);
  const allowedModifications = name === 'aiwf-spec' ? ['NOTICE'] : [];
  for (const [path, expected] of Object.entries(provenance.modified_sha256)) {
    assert.ok(allowedModifications.includes(path), `Upstream sources must stay unchanged: ${name}/${path}`);
    assert.equal(digest(readFileSync(join(plugin, path))), expected, `Modified resource changed: ${name}/${path}`);
    modified++;
  }
  for (const [path, expected] of Object.entries(provenance.upstream_sha256)) {
    const bytes = readFileSync(join(plugin, path));
    if (Object.hasOwn(provenance.modified_sha256, path)) {
      assert.equal(path, 'NOTICE');
      assert.match(bytes.toString(), /derived from the AI Unified Process Marketplace by Simon Martinelli/);
    } else {
      assert.equal(digest(bytes), expected, `Upstream resource changed: ${name}/${path}`);
      verified++;
    }
    if (path.endsWith('/SKILL.md')) { importedSkills++; }
  }
  for (const directory of ['skills', 'rules', 'agents']) {
    if (!existsSync(join(plugin, directory))) { continue; }
    for (const file of files(join(plugin, directory))) {
      const relative = file.slice(plugin.length + 1);
      if (name === 'aiwf-spec' && relative.startsWith('skills/workflow/')) { continue; }
      assert.ok(Object.hasOwn(provenance.upstream_sha256, relative), `Resource missing provenance: ${name}/${relative}`);
    }
  }
  const names = readdirSync(join(plugin, 'skills')).sort();
  skills += names.length;
  for (const skill of names) {
    const file = join(plugin, 'skills', skill, 'SKILL.md');
    const text = read(file);
    assert.match(text, new RegExp(`^---\\nname: ${skill}\\n`, 'm'), `Skill name mismatch: ${name}/${skill}`);
    assert.match(text, /^description: .+/m);
    assert.match(text, /Apache(-| License, Version )2\.0/);
    for (const markdown of files(dirname(file)).filter(path => path.endsWith('.md'))) {
      const prose = read(markdown).replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
      for (const match of prose.matchAll(/\]\(([^\s)]+)\)/g)) {
        const ref = match[1].split('#')[0];
        // Project-artifact links in template examples are not bundled resources.
        if (!/^(references|scripts)\//.test(ref)) { continue; }
        assert.ok(existsSync(resolve(dirname(markdown), ref)), `Broken bundled reference: ${name}/${skill}: ${ref}`);
      }
    }
  }
  const entry = market.plugins.find(p => p.name === name);
  assert.ok(entry, `Marketplace entry missing: ${name}`);
  assert.equal(entry.source, `./plugins/${name}`);
  const manifest = JSON.parse(read(join(plugin, '.claude-plugin/plugin.json')));
  assert.equal(manifest.name, entry.name);
  assert.equal(manifest.version, entry.version);
  assert.ok(pkg.files.includes(`plugins/${name}/`), `Package excludes plugin: ${name}`);
}
assert.equal(importedSkills, 31);
assert.equal(skills, 32);
assert.equal(pkg.bin['aiwf-spec'], './src/cli/spec-cli.js');
console.log(`AIWF: ${importedSkills} unchanged upstream skills + ${skills - importedSkills} workflow; ${verified} unchanged upstream resources, ${modified} attributed NOTICE modification; references and manifests validated.`);
