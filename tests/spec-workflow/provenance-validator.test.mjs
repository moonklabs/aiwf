import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-provenance-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'plugins'));
  for (const path of ['.claude-plugin', 'package.json', 'scripts/validate-spec-plugin.mjs', 'scripts/install-spec-skills.mjs']) {
    cpSync(join(repository, path), join(root, path), { recursive: true });
  }
  for (const name of ['spec', 'vaadin-jooq', 'angular-jpa', 'blazor-dotnet', 'nestjs-nextjs']) {
    cpSync(join(repository, 'plugins', `aiwf-${name}`), join(root, 'plugins', `aiwf-${name}`), { recursive: true });
  }
  return root;
}

test('validator rejects modified upstream skill bytes', t => {
  const root = fixture(t);
  const skill = join(root, 'plugins/aiwf-spec/skills/requirements/SKILL.md');
  writeFileSync(skill, readFileSync(skill, 'utf8') + '\nUnrecorded change.\n');
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Upstream resource changed: aiwf-spec\/skills\/requirements\/SKILL.md/);
});

test('modified-hash metadata cannot exempt a skill from source preservation', t => {
  const root = fixture(t);
  const plugin = join(root, 'plugins/aiwf-spec');
  const path = 'skills/requirements/SKILL.md';
  const text = readFileSync(join(plugin, path), 'utf8') + '\nRecorded but forbidden change.\n';
  writeFileSync(join(plugin, path), text);
  const provenance = JSON.parse(readFileSync(join(plugin, 'UPSTREAM.json'), 'utf8'));
  provenance.modified_sha256[path] = createHash('sha256').update(text).digest('hex');
  writeFileSync(join(plugin, 'UPSTREAM.json'), JSON.stringify(provenance));
  const check = spawnSync(process.execPath, [join(root, 'scripts/validate-spec-plugin.mjs')], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Upstream sources must stay unchanged: aiwf-spec\/skills\/requirements\/SKILL.md/);
});
