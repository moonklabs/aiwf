import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installSkills, skillDestination, skillInstallationStatus } from '../../src/lib/skill-installation.js';

const cli = fileURLToPath(new URL('../../src/cli/aiwf-cli.js', import.meta.url));
function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-managed-install-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function copyingBackend(root, calls = [], { global = false, claudeConfigDir } = {}) {
  return request => {
    calls.push(request);
    for (const name of request.skills) {
      const target = skillDestination(root, request.agent, global, name, claudeConfigDir);
      mkdirSync(target, { recursive: true });
      cpSync(join(request.source, 'skills', name), target, { recursive: true });
    }
    return { status: 0 };
  };
}

test('dry run has no filesystem effects and reports opt-in selection', t => {
  const root = project(t);
  const result = installSkills({ project: root, agents: ['codex', 'claude-code'], stacks: ['electron-react'], delegates: ['claude'], dryRun: true });
  assert.equal(result.success, true);
  assert.ok(result.items.some(item => item.name === 'aiwf-delegate-claude'));
  assert.ok(!result.items.some(item => item.name === 'aiwf-delegate-codex'));
  assert.ok(result.items.some(item => item.agent === 'claude-code' && item.destination.includes('.claude/skills')));
  assert.equal(existsSync(join(root, '.aiwf')), false);
  assert.equal(existsSync(join(root, '.agents')), false);
});

test('repeat installation is a no-op; later stacks and a second host are additive', t => {
  const root = project(t);
  const calls = [];
  const backend = copyingBackend(root, calls);
  const base = { project: root, agents: ['codex'] };
  installSkills(base, { backend });
  const repeat = installSkills(base, { backend });
  assert.ok(repeat.items.every(item => item.action === 'keep'));
  assert.equal(calls.length, 1);
  installSkills({ ...base, stacks: ['electron-react'] }, { backend });
  assert.ok(calls[1].skills.every(name => name.startsWith('aiwf-electron-react-')));
  installSkills({ ...base, agents: ['codex', 'claude-code'], stacks: ['electron-react'] }, { backend });
  assert.equal(calls[2].agent, 'claude-code');
  assert.equal(calls.length, 3);
  assert.equal(skillInstallationStatus({ project: root }).success, true);
});

test('unmanaged directories and edited managed files block all writes', t => {
  const root = project(t);
  const base = { project: root, agents: ['codex'] };
  const target = skillDestination(root, 'codex', false, 'aiwf-requirements');
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'SKILL.md'), 'personal skill');
  const before = readFileSync(join(target, 'SKILL.md'), 'utf8');
  assert.throws(() => installSkills(base), /conflicts/);
  assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), before);
  assert.equal(existsSync(join(root, '.aiwf')), false);
  rmSync(target, { recursive: true });
  installSkills(base, { backend: copyingBackend(root) });
  writeFileSync(join(target, 'SKILL.md'), 'edited instructions');
  assert.throws(() => installSkills({ ...base, stacks: ['electron-react'] }), /conflicts/);
  assert.equal(existsSync(skillDestination(root, 'codex', false, 'aiwf-electron-react-implement')), false);
  assert.ok(skillInstallationStatus({ project: root }).items.some(item => item.status === 'modified'));
});

test('verified partial installs are recorded and a retry resumes the remaining skills', t => {
  const root = project(t);
  const options = { project: root, agents: ['codex'] };
  const copy = copyingBackend(root);
  assert.throws(() => installSkills(options, { backend: request => {
    copy({ ...request, skills: request.skills.slice(0, 1) });
    return { status: 1, stderr: 'simulated transport failure' };
  } }), /incomplete/);
  assert.equal(skillInstallationStatus({ project: root }).items.length, 1);
  const calls = [];
  const result = installSkills(options, { backend: copyingBackend(root, calls) });
  assert.equal(result.success, true);
  assert.ok(result.items.some(item => item.action === 'keep'));
  assert.ok(!calls[0].skills.includes(result.items.find(item => item.action === 'keep').name));
});

test('user scope and Claude configuration path are independent from CLI installation', t => {
  const home = project(t);
  const config = join(home, 'custom-claude');
  const options = { global: true, home, claudeConfigDir: config, agents: ['codex', 'claude-code'], coreOnly: true };
  const result = installSkills(options, { backend: copyingBackend(home, [], { global: true, claudeConfigDir: config }) });
  assert.equal(result.scope, 'user');
  assert.ok(existsSync(join(home, '.agents/skills/aiwf-requirements/SKILL.md')));
  assert.ok(existsSync(join(config, 'skills/aiwf-requirements/SKILL.md')));
  assert.equal(existsSync(join(home, '.codex')), false);
  assert.equal(skillInstallationStatus(options).success, true);
  assert.equal(skillInstallationStatus({ ...options, claudeConfigDir: join(home, 'other-config') }).success, false);
});

test('symlinked destinations, receipts and active locks are rejected without external writes', t => {
  const root = project(t);
  const outside = project(t);
  const options = { project: root, agents: ['codex'] };
  symlinkSync(outside, join(root, '.agents'));
  assert.throws(() => installSkills(options), /symbolic links/);
  assert.equal(existsSync(join(outside, 'skills')), false);
  rmSync(join(root, '.agents'));
  mkdirSync(join(root, '.aiwf'));
  symlinkSync(join(outside, 'record.json'), join(root, '.aiwf/skills-installation.json'));
  assert.throws(() => installSkills(options), /regular installation record/);
  rmSync(join(root, '.aiwf/skills-installation.json'));
  mkdirSync(join(root, '.aiwf/skills-installation.lock'));
  assert.throws(() => installSkills(options), /already running/);
});

test('skills lockfiles cannot redirect writes or silently discard existing tracking', t => {
  const root = project(t);
  const outside = project(t);
  const options = { project: root, agents: ['codex'] };
  symlinkSync(join(outside, 'lock.json'), join(root, 'skills-lock.json'));
  assert.throws(() => installSkills(options), /regular skills lockfile/);
  assert.equal(existsSync(join(outside, 'lock.json')), false);
  rmSync(join(root, 'skills-lock.json'));
  writeFileSync(join(root, 'skills-lock.json'), 'invalid user tracking');
  assert.throws(() => installSkills(options), /Invalid skills lockfile/);
  assert.equal(readFileSync(join(root, 'skills-lock.json'), 'utf8'), 'invalid user tracking');
});

test('actual pinned skills backend installs both hosts and leaves usable local lock sources', t => {
  const root = project(t);
  const result = installSkills({ project: root, agents: ['codex', 'claude-code'], stacks: ['electron-react'] });
  assert.equal(result.success, true);
  assert.equal(result.backend_version, '1.7.0');
  assert.ok(result.items.every(item => item.action === 'installed'));
  for (const agent of ['codex', 'claude-code']) {
    const target = skillDestination(root, agent, false, 'aiwf-electron-react-implement');
    assert.match(readFileSync(join(target, 'SKILL.md'), 'utf8'), /name: aiwf-electron-react-implement/);
    assert.ok(existsSync(join(target, 'references/architecture.md')));
    assert.ok(existsSync(join(target, 'LICENSE')));
  }
  const lock = JSON.parse(readFileSync(join(root, 'skills-lock.json'), 'utf8'));
  for (const item of Object.values(lock.skills)) { assert.ok(existsSync(resolve(root, item.source)), `missing retained source ${item.source}`); }
  const repeat = installSkills({ project: root, agents: ['codex', 'claude-code'], stacks: ['electron-react'] });
  assert.ok(repeat.items.every(item => item.action === 'keep'));
});

test('npm-style bin symlink works from another cwd and strict CLI parsing preserves dry-run', t => {
  const root = project(t);
  const bin = join(root, 'aiwf');
  symlinkSync(cli, bin);
  const run = args => spawnSync(process.execPath, [bin, ...args], { cwd: root, encoding: 'utf8' });
  assert.match(run(['--help']).stdout, /npm i -g aiwf/);
  const dry = run(['install', '--agent', 'codex', 'claude-code', '--stack', 'electron-react', '--dry-run', '--json']);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).dry_run, true);
  assert.equal(existsSync(join(root, '.aiwf')), false);
  for (const args of [['install'], ['install', '--unknown'], ['install', '--agent'], ['install', '--agent', 'codex', '--project', root, '--global']]) {
    assert.equal(run(args).status, 2);
  }
  const design = run(['install', '--agent', 'codex', '--design', '--dry-run', '--json']);
  assert.equal(design.status, 0, design.stderr);
  assert.equal(JSON.parse(design.stdout).items.filter(item => item.plugin === 'aiwf-design').length, 5);
  assert.equal(run(['install', '--agent', 'codex', '--design', '--design', '--dry-run']).status, 2);
  const unknown = run(['install', '--agent', 'unknown', '--dry-run', '--json']);
  assert.equal(unknown.status, 1);
  assert.equal(run(['spec', '--help']).status, 0);
  assert.equal(JSON.parse(run(['list', '--json']).stdout).bundles[0].name, 'aiwf-core');
});
