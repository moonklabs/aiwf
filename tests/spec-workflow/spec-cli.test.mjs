import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { initSpec, pinSpec } from '../../src/lib/spec-workflow.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(here, '../../src/cli/spec-cli.js');

function tmpRoot(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `aiwf-cli-${label}-`));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function makeReadyProject() {
  const root = tmpRoot('ready');
  initSpec(root, 'CLI Product');
  const docs = path.join(root, 'docs');
  write(path.join(docs, 'vision.md'), '# Vision\n\nStatus: Approved\n\nA small honest tool.\n');
  write(path.join(docs, 'requirements.md'), '# Requirements\n\n- FR-001: must work.\n');
  write(path.join(docs, 'glossary.md'), '# Glossary\n\n- spec: a described behavior.\n');
  write(path.join(docs, 'entity_model.md'), '# Entity Model\n\n- Entity: Spec\n');
  write(path.join(docs, 'use_cases.puml'), '@startuml\nactor User\nusecase "Do thing"\n@enduml\n');
  write(path.join(docs, 'use_cases', 'UC-001.md'), '# UC-001\n');
  write(path.join(docs, 'test_cases', 'TC-001.md'), '# TC-001\n');
  return root;
}

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    cwd: options.cwd,
    env: process.env
  });
}

test('cli init prints machine JSON and exits zero', () => {
  const root = tmpRoot('init');
  const res = runCli(['init', '--root', root, '--name', 'CLI Product', '--json']);
  assert.equal(res.status, 0, res.stderr);
  const body = JSON.parse(res.stdout);
  assert.equal(body.command, 'init');
  assert.ok(body.created.includes('docs/vision.md'));
  assert.ok(fs.existsSync(path.join(root, 'docs', 'vision.md')));
});

test('cli check --json reports ok on a pinned spec and nonzero drift afterwards', () => {
  const root = makeReadyProject();
  const pin = runCli(['pin', '--root', root, '--json']);
  assert.equal(pin.status, 0, pin.stderr);
  assert.equal(JSON.parse(pin.stdout).command, 'pin');

  const ok = runCli(['check', '--root', root, '--json']);
  assert.equal(ok.status, 0, ok.stderr);
  const okBody = JSON.parse(ok.stdout);
  assert.equal(okBody.status, 'ok');
  assert.equal(okBody.in_sync, true);

  write(path.join(root, 'docs', 'glossary.md'), '# Glossary\n\n- changed.\n');
  const drift = runCli(['check', '--root', root, '--json']);
  assert.notEqual(drift.status, 0);
  const driftBody = JSON.parse(drift.stdout);
  assert.equal(driftBody.status, 'drift');
  assert.ok(driftBody.changed.includes('docs/glossary.md'));
});

test('cli check exits nonzero when no pin exists', () => {
  const root = makeReadyProject();
  const res = runCli(['check', '--root', root, '--json']);
  assert.notEqual(res.status, 0);
  assert.equal(JSON.parse(res.stdout).status, 'pin_missing');
});

test('cli packet writes a review packet and refuses to overwrite without --force', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  write(path.join(root, 'logs', 'unit.log'), 'ok\n');
  const evidence = path.join(root, 'evidence.json');
  write(
    evidence,
    JSON.stringify({ checks: [{ name: 'unit', command: 'node --test', status: 'passed', log: 'logs/unit.log' }] })
  );

  const first = runCli(['packet', '--root', root, '--evidence', evidence, '--json']);
  assert.equal(first.status, 0, first.stderr);
  const packet = JSON.parse(first.stdout);
  assert.equal(packet.status, 'awaiting_review');
  assert.equal(packet.remote_sync, 'not_attempted');
  assert.ok(fs.existsSync(path.join(root, '.aiwf', 'review-packet.json')));

  const second = runCli(['packet', '--root', root, '--evidence', evidence, '--json']);
  assert.notEqual(second.status, 0);
  assert.equal(JSON.parse(second.stdout).error.code, 'output_exists');

  const forced = runCli(['packet', '--root', root, '--evidence', evidence, '--json', '--force']);
  assert.equal(forced.status, 0, forced.stderr);
});

test('cli rejects unknown options and missing required arguments with nonzero exit', () => {
  const unknown = runCli(['init', '--root', tmpRoot('u'), '--name', 'x', '--bogus']);
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /Unknown option/);

  const missing = runCli(['packet', '--root', tmpRoot('m')]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /Missing required option/);

  const badCommand = runCli(['frobnicate']);
  assert.notEqual(badCommand.status, 0);

  const extraPositional = runCli(['check', '--root', tmpRoot('p'), 'surprise']);
  assert.notEqual(extraPositional.status, 0);
});

test('cli help exits zero and documents the commands', () => {
  const res = runCli(['--help']);
  assert.equal(res.status, 0);
  for (const cmd of ['init', 'pin', 'check', 'packet']) {
    assert.match(res.stdout, new RegExp(cmd));
  }
});

test('cli pin is blocked on Draft templates and exits nonzero', () => {
  const root = tmpRoot('draft');
  initSpec(root, 'Draft');
  const res = runCli(['pin', '--root', root, '--json']);
  assert.notEqual(res.status, 0);
  assert.equal(JSON.parse(res.stdout).error.code, 'draft_markers');
});

test('cli packet rejects an --output escaping the root or a symlinked output', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  write(path.join(root, 'logs', 'unit.log'), 'ok\n');
  const evidence = path.join(root, 'evidence.json');
  write(
    evidence,
    JSON.stringify({ checks: [{ name: 'unit', command: 'node --test', status: 'passed', log: 'logs/unit.log' }] })
  );

  const escape = runCli(['packet', '--root', root, '--evidence', evidence, '--output', '../outside.json', '--json'], {
    cwd: root
  });
  assert.notEqual(escape.status, 0);
  assert.equal(JSON.parse(escape.stdout).error.code, 'output_outside_root');
  assert.equal(fs.existsSync(path.join(path.dirname(root), 'outside.json')), false);

  const outsideTarget = path.join(tmpRoot('outside'), 'real.json');
  write(outsideTarget, 'x');
  fs.symlinkSync(outsideTarget, path.join(root, 'linked.json'));
  const linked = runCli(
    ['packet', '--root', root, '--evidence', evidence, '--output', path.join(root, 'linked.json'), '--json'],
    { cwd: root }
  );
  assert.notEqual(linked.status, 0);
  assert.equal(JSON.parse(linked.stdout).error.code, 'symlink_not_allowed');
});

test('cli check on a tampered pin exits nonzero with pin_invalid JSON', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const pinFile = path.join(root, '.aiwf', 'spec-pin.json');
  const pin = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
  pin.files[0].sha256 = 'c'.repeat(64);
  fs.writeFileSync(pinFile, `${JSON.stringify(pin, null, 2)}\n`);

  const res = runCli(['check', '--root', root, '--json']);
  assert.notEqual(res.status, 0);
  const body = JSON.parse(res.stdout);
  assert.equal(body.status, 'pin_invalid');
  assert.equal(body.error.code, 'pin_digest_mismatch');
  assert.ok(Array.isArray(body.added));
  assert.ok(Array.isArray(body.changed));
});
