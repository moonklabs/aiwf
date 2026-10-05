import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));

const AUTHORED_STACK = 'aiwf-electron-react';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-provenance-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'plugins'));
  mkdirSync(join(root, 'src/lib'), { recursive: true });
  for (const path of ['.claude-plugin', 'package.json', 'scripts/validate-spec-plugin.mjs', 'scripts/install-spec-skills.mjs', 'src/lib/skill-bundles.js']) {
    cpSync(join(repository, path), join(root, path), { recursive: true });
  }
  for (const name of ['core', 'spec', 'design', 'vaadin-jooq', 'angular-jpa', 'blazor-dotnet', 'nestjs-nextjs', 'electron-react', 'delegate-claude', 'delegate-codex']) {
    cpSync(join(repository, 'plugins', `aiwf-${name}`), join(root, 'plugins', `aiwf-${name}`), { recursive: true });
  }
  return root;
}

test('validator rejects modified upstream skill bytes', t => {
  const root = fixture(t);
  const skill = join(root, 'plugins/aiwf-core/skills/requirements/SKILL.md');
  writeFileSync(skill, readFileSync(skill, 'utf8') + '\nUnrecorded change.\n');
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Upstream resource changed: aiwf-core\/skills\/requirements\/SKILL.md/);
});

test('validator rejects untracked aiwf-spec resources outside the named AIWF-owned skill directories', t => {
  const root = fixture(t);
  mkdirSync(join(root, 'plugins/aiwf-spec/skills/rogue'), { recursive: true });
  writeFileSync(join(root, 'plugins/aiwf-spec/skills/rogue/SKILL.md'), 'rogue skill');
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.ok(check.stderr.includes('Resource missing provenance: aiwf-spec/skills/rogue/SKILL.md'), check.stderr);
});

test('modified-hash metadata cannot exempt a skill from source preservation', t => {
  const root = fixture(t);
  const plugin = join(root, 'plugins/aiwf-core');
  const path = 'skills/requirements/SKILL.md';
  const text = readFileSync(join(plugin, path), 'utf8') + '\nRecorded but forbidden change.\n';
  writeFileSync(join(plugin, path), text);
  const provenance = JSON.parse(readFileSync(join(plugin, 'UPSTREAM.json'), 'utf8'));
  provenance.modified_sha256[path] = createHash('sha256').update(text).digest('hex');
  writeFileSync(join(plugin, 'UPSTREAM.json'), JSON.stringify(provenance));
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Upstream sources must stay unchanged: aiwf-core\/skills\/requirements\/SKILL.md/);
});

test('validator accepts the authored electron-react stack without upstream provenance', t => {
  const root = fixture(t);
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr + check.stdout);
  assert.match(check.stdout, /electron-react/);
});

test('validator rejects untracked resources outside the named electron-react skill roots', t => {
  const root = fixture(t);
  mkdirSync(join(root, `plugins/${AUTHORED_STACK}/skills/rogue`), { recursive: true });
  writeFileSync(join(root, `plugins/${AUTHORED_STACK}/skills/rogue/SKILL.md`), 'rogue skill');
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.ok(check.stderr.includes(`Resource missing provenance: ${AUTHORED_STACK}/skills/rogue/SKILL.md`), check.stderr);
});

test('validator rejects an undeclared resource at the authored electron-react plugin root', t => {
  const root = fixture(t);
  mkdirSync(join(root, `plugins/${AUTHORED_STACK}/rules`), { recursive: true });
  writeFileSync(join(root, `plugins/${AUTHORED_STACK}/rules/rogue.md`), '# rogue rule\n');
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.ok(check.stderr.includes(`Resource missing provenance: ${AUTHORED_STACK}/rules/rogue.md`), check.stderr);
});

test('validator rejects a missing declared electron-react reference file', t => {
  const root = fixture(t);
  rmSync(join(root, `plugins/${AUTHORED_STACK}/skills/implement/references/architecture.md`));
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  // The skill links its reference, so the broken-link guard reports it before the declared
  // resource check can; either is a valid rejection of the missing bundled file.
  assert.match(check.stderr, /(Broken bundled reference: aiwf-electron-react\/implement: references\/architecture\.md|Missing declared resource: aiwf-electron-react\/skills\/implement\/references\/architecture\.md)/);
});

test('validator requires the design plugin to declare its aiwf-core dependency and no upstream record', t => {
  const root = fixture(t);
  const manifestPath = join(root, 'plugins/aiwf-design/.claude-plugin/plugin.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ...manifest, dependencies: [] }));
  const missing = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Manifest dependency missing: aiwf-design -> aiwf-core/);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  writeFileSync(join(root, 'plugins/aiwf-design/UPSTREAM.json'), '{}');
  const upstream = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(upstream.status, 1);
  assert.match(upstream.stderr, /must not carry UPSTREAM.json: aiwf-design/);
});
