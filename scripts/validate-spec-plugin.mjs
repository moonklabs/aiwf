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

// AIWF-authored plugins are written in this repository, not imported, so they carry no
// UPSTREAM.json. Each entry names the exact skill roots authored here, the skill set the
// plugin must expose, and any bundled resource files it promises to ship. Keep these lists
// explicit: a resource outside the named roots is still rejected for missing provenance.
const authoredPlugins = new Map([
  ['aiwf-spec', {
    skillRoots: ['skills/workflow/', 'skills/sync-docs/'],
    skills: ['sync-docs', 'workflow'],
    license: /Apache(-| License, Version )2\.0/,
    manifestLicense: 'Apache-2.0'
  }],
  ['aiwf-electron-react', {
    skillRoots: [
      'skills/scaffold/',
      'skills/implement/',
      'skills/agent-runtime/',
      'skills/renderer-test/',
      'skills/electron-test/',
      'skills/package/'
    ],
    skills: ['agent-runtime', 'electron-test', 'implement', 'package', 'renderer-test', 'scaffold'],
    resources: ['skills/scaffold/references/stack-profile.md', 'skills/implement/references/architecture.md'],
    license: null,
    manifestLicense: 'MIT',
    licenseFile: 'LICENSE'
  }]
]);
const isAuthoredResource = (name, relative) => {
  const authored = authoredPlugins.get(name);
  return authored !== undefined && authored.skillRoots.some(directory => relative.startsWith(directory));
};

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

for (const name of ['aiwf-core', 'aiwf-spec', ...supportedStacks.map(stack => `aiwf-${stack}`)]) {
  const plugin = join(root, 'plugins', name);
  const authored = authoredPlugins.get(name);
  const provenance = authored ? { upstream_sha256: {}, modified_sha256: {} }
    : JSON.parse(read(join(plugin, 'UPSTREAM.json')));
  if (!authored) {
    assert.equal(provenance.repository, 'https://github.com/AI-Unified-Process/marketplace');
    assert.match(provenance.commit, /^[0-9a-f]{40}$/);
    commit ??= provenance.commit;
    assert.equal(provenance.commit, commit, `Mixed upstream versions: ${name}`);
  }
  const allowedModifications = name === 'aiwf-core' ? ['NOTICE'] : [];
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
      if (isAuthoredResource(name, relative)) { continue; }
      assert.ok(Object.hasOwn(provenance.upstream_sha256, relative), `Resource missing provenance: ${name}/${relative}`);
    }
  }
  const names = readdirSync(join(plugin, 'skills')).sort();
  if (name === 'aiwf-core') { assert.equal(names.length, 7); }
  if (authored) { assert.deepEqual(names, authored.skills, `Skill set mismatch: ${name}`); }
  skills += names.length;
  for (const skill of names) {
    const file = join(plugin, 'skills', skill, 'SKILL.md');
    const text = read(file);
    assert.match(text, new RegExp(`^---\\nname: ${skill}\\n`, 'm'), `Skill name mismatch: ${name}/${skill}`);
    assert.match(text, /^description: .+/m);
    const licensePattern = authored ? authored.license : /Apache(-| License, Version )2\.0/;
    if (licensePattern) { assert.match(text, licensePattern, `Skill license text missing: ${name}/${skill}`); }
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
  if (authored) {
    assert.equal(manifest.license, authored.manifestLicense, `Manifest license mismatch: ${name}`);
    for (const resource of authored.resources ?? []) {
      assert.ok(existsSync(join(plugin, resource)), `Missing declared resource: ${name}/${resource}`);
    }
    if (authored.licenseFile) {
      assert.ok(existsSync(join(plugin, authored.licenseFile)), `Missing license file: ${name}/${authored.licenseFile}`);
      assert.match(read(join(plugin, authored.licenseFile)), /MIT License|Permission is hereby granted, free of charge/, `License text mismatch: ${name}/${authored.licenseFile}`);
    }
  }
  assert.ok(pkg.files.includes(`plugins/${name}/`), `Package excludes plugin: ${name}`);
}
assert.equal(importedSkills, 31);
const delegationTargets = ['claude', 'codex'];
for (const target of delegationTargets) {
  const name = `aiwf-delegate-${target}`;
  const plugin = join(root, 'plugins', name);
  const expectedSkill = `delegate-${target}`;
  assert.deepEqual(readdirSync(join(plugin, 'skills')), [expectedSkill]);
  const skill = read(join(plugin, 'skills', expectedSkill, 'SKILL.md'));
  assert.match(skill, new RegExp(`^name: ${expectedSkill}$`, 'm'));
  assert.match(skill, /^disable-model-invocation: true$/m);
  assert.match(read(join(plugin, 'skills', expectedSkill, 'agents/openai.yaml')), /allow_implicit_invocation: false/);
  for (const requiredPolicy of [
    /current user request contains the literal token `--cross-cli`/,
    /does not consent to starting a separate CLI process/,
    /For cross-CLI work, default to read-only/,
    /explicitly asks for file changes, with the files or directory scope stated/,
    /Native subagents follow the current host's normal permission policy/,
    /If the native subagent tool is unavailable, report that route as unavailable and stop, even when `--cross-cli` is present/,
    /Do not substitute this host's native agents, another provider, or do the task yourself/,
    /Do not substitute `npx`, a bundled or renamed binary, or another provider's CLI/,
    /same operating-system account and inherits the current working directory and environment/,
    /not a security-isolation boundary/,
    /Do not expose environment secrets in prompts or output/,
    /instead of retrying through another tool, broader access, or `sudo`/
  ]) {
    assert.match(skill, requiredPolicy, `Missing delegation safety policy: ${name} ${requiredPolicy}`);
  }
  if (target === 'claude') {
    assert.match(skill, /--permission-mode plan/);
    assert.match(skill, /Never add `--dangerously-skip-permissions`/);
  } else {
    assert.match(skill, /Codex `exec` defaults to a read-only sandbox/);
    assert.match(skill, /Add `--sandbox workspace-write` only if the current user request explicitly authorizes writes/);
    assert.match(skill, /Never add `--full-auto`, `--danger-full-access`/);
  }
  const entry = market.plugins.find(item => item.name === name);
  assert.ok(entry, `Marketplace entry missing: ${name}`);
  assert.equal(entry.source, `./plugins/${name}`);
  assert.equal(entry.version, '0.1.0');
  for (const manifestPath of ['.claude-plugin/plugin.json', 'plugin.json']) {
    const manifest = JSON.parse(read(join(plugin, manifestPath)));
    assert.equal(manifest.name, name);
    assert.equal(manifest.version, entry.version);
  }
  assert.ok(pkg.files.includes(`plugins/${name}/`), `Package excludes plugin: ${name}`);
  skills++;
}
assert.equal(skills, 41);
assert.equal(pkg.bin['aiwf-spec'], './src/cli/spec-cli.js');
console.log(`AIWF: ${importedSkills} unchanged upstream skills + ${skills - importedSkills} AIWF skills (workflow, sync-docs, the authored electron-react stack and optional delegates); ${verified} unchanged upstream resources, ${modified} attributed NOTICE modification; references, declared resources and manifests validated.`);
