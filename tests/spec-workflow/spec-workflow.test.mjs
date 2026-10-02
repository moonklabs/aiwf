import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

import {
  initSpec,
  pinSpec,
  checkSpec,
  createReviewPacket,
  writeReviewPacket,
  computePinDigest,
  findDraftMarkers,
  collectSnapshot,
  parseEvidence,
  validateStoredPin,
  SpecError,
  REQUIRED_SPEC_FILES
} from '../../src/lib/spec-workflow.js';

function tmpRoot(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `aiwf-${label}-`));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function sha256(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

function readPin(root) {
  return JSON.parse(fs.readFileSync(path.join(root, '.aiwf', 'spec-pin.json'), 'utf8'));
}

function writePin(root, pin) {
  fs.writeFileSync(path.join(root, '.aiwf', 'spec-pin.json'), `${JSON.stringify(pin, null, 2)}\n`);
}

// Build a project whose required spec files are complete and free of draft markers.
function makeReadyProject(name = 'Demo Product') {
  const root = tmpRoot('ready');
  initSpec(root, name);
  const docs = path.join(root, 'docs');
  write(path.join(docs, 'vision.md'), '# Vision\n\nStatus: Approved\n\nWe ship a small honest tool.\n');
  write(path.join(docs, 'requirements.md'), '# Requirements\n\n- FR-001: the system must work.\n');
  write(path.join(docs, 'glossary.md'), '# Glossary\n\n- spec: a described behavior.\n');
  write(path.join(docs, 'entity_model.md'), '# Entity Model\n\n- Entity: Spec\n');
  write(path.join(docs, 'use_cases.puml'), '@startuml\nactor User\nusecase "Do thing"\n@enduml\n');
  write(path.join(docs, 'use_cases', 'UC-001-do-thing.md'), '# UC-001 Do thing\n\nActor: User\n');
  write(path.join(docs, 'test_cases', 'TC-001-do-thing.md'), '# TC-001 Do thing\n\nSteps.\n');
  return root;
}

test('init creates Draft templates and empty use_case/test_case directories', () => {
  const root = tmpRoot('init');
  const result = initSpec(root, 'My Product');

  for (const rel of REQUIRED_SPEC_FILES) {
    const file = path.join(root, rel);
    assert.ok(fs.existsSync(file), `${rel} exists`);
    const text = fs.readFileSync(file, 'utf8');
    assert.match(text, /Draft/, `${rel} is marked Draft`);
    assert.match(text, /TODO/, `${rel} carries an explicit TODO`);
    assert.ok(result.created.includes(rel), `${rel} reported created`);
  }

  const vision = fs.readFileSync(path.join(root, 'docs', 'vision.md'), 'utf8');
  assert.match(vision, /My Product/);

  assert.ok(fs.statSync(path.join(root, 'docs', 'use_cases')).isDirectory());
  assert.ok(fs.statSync(path.join(root, 'docs', 'test_cases')).isDirectory());
  assert.equal(fs.readdirSync(path.join(root, 'docs', 'use_cases')).length, 0, 'use_cases stays empty');
  assert.equal(fs.readdirSync(path.join(root, 'docs', 'test_cases')).length, 0, 'test_cases stays empty');
});

test('init is idempotent and never overwrites existing user files', () => {
  const root = tmpRoot('idem');
  initSpec(root, 'First Name');
  const vision = path.join(root, 'docs', 'vision.md');
  const userContent = '# Vision\n\nStatus: Approved\n\nUser authored.\n';
  fs.writeFileSync(vision, userContent);
  write(path.join(root, 'docs', 'use_cases', 'UC-009-user.md'), '# user file\n');

  const second = initSpec(root, 'Second Name');
  assert.equal(fs.readFileSync(vision, 'utf8'), userContent, 'user file preserved');
  assert.ok(second.preserved.includes('docs/vision.md'));
  assert.equal(
    fs.readFileSync(path.join(root, 'docs', 'use_cases', 'UC-009-user.md'), 'utf8'),
    '# user file\n'
  );
  assert.ok(second.preserved.includes('docs/use_cases'), 'use_cases directory preserved');
  // Files that never existed are still filled in on the second pass.
  assert.ok(second.created.includes('docs/requirements.md') === false);
});

test('init rejects a symlinked artifact directory', () => {
  const root = tmpRoot('initsym');
  const outside = tmpRoot('outside');
  fs.symlinkSync(outside, path.join(root, 'docs'));
  assert.throws(() => initSpec(root, 'Nope'), err => err instanceof SpecError && err.code === 'symlink_not_allowed');
});

test('init rejects a symlinked required artifact file', () => {
  const root = tmpRoot('initsymfile');
  fs.mkdirSync(path.join(root, 'docs'));
  const target = path.join(tmpRoot('target'), 'real.md');
  fs.writeFileSync(target, 'x');
  fs.symlinkSync(target, path.join(root, 'docs', 'vision.md'));
  assert.throws(() => initSpec(root, 'Nope'), err => err instanceof SpecError && err.code === 'symlink_not_allowed');
});

test('pin is blocked while templates remain Draft', () => {
  const root = tmpRoot('draft');
  initSpec(root, 'Draft Product');
  assert.throws(
    () => pinSpec(root, {}),
    err => err instanceof SpecError && err.code === 'draft_markers'
  );
  assert.equal(fs.existsSync(path.join(root, '.aiwf', 'spec-pin.json')), false);
});

test('pin requires at least one use case and one test case', () => {
  const root = makeReadyProject();
  fs.rmSync(path.join(root, 'docs', 'use_cases', 'UC-001-do-thing.md'));
  assert.throws(() => pinSpec(root, {}), err => err instanceof SpecError && err.code === 'insufficient_use_cases');

  write(path.join(root, 'docs', 'use_cases', 'UC-001-do-thing.md'), '# UC-001\n');
  fs.rmSync(path.join(root, 'docs', 'test_cases', 'TC-001-do-thing.md'));
  assert.throws(() => pinSpec(root, {}), err => err instanceof SpecError && err.code === 'insufficient_test_cases');
});

test('pin is deterministic and idempotent for unchanged content', () => {
  const root = makeReadyProject();
  const first = pinSpec(root, {});
  assert.equal(first.unchanged, false);
  const scratch = tmpRoot('scratch');
  initSpec(scratch, 'Demo Product');

  const filesA = collectSnapshot(root).files.map(f => ({ path: f.path, sha256: f.sha256 }));
  const filesB = collectSnapshot(root).files.map(f => ({ path: f.path, sha256: f.sha256 }));
  assert.deepEqual(filesA, filesB, 'snapshots are stable across runs');
  assert.equal(computePinDigest(collectSnapshot(root).files), first.pin.spec_digest);

  const second = pinSpec(root, {});
  assert.equal(second.unchanged, true, 'same content is idempotent');
});

test('pin refuses to overwrite without --refresh and honors --refresh', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  write(path.join(root, 'docs', 'glossary.md'), '# Glossary\n\n- spec: changed definition.\n');

  assert.throws(() => pinSpec(root, {}), err => err instanceof SpecError && err.code === 'pin_exists');

  const refreshed = pinSpec(root, { refresh: true });
  assert.equal(refreshed.unchanged, false);
  const after = checkSpec(root);
  assert.equal(after.status, 'ok');
});

test('check reports ok, drift (added/changed/deleted), draft, and missing pin', () => {
  const clean = makeReadyProject();
  assert.equal(checkSpec(clean).status, 'pin_missing', 'no pin yet');
  pinSpec(clean, {});
  assert.equal(checkSpec(clean).status, 'ok');

  // added
  write(path.join(clean, 'docs', 'use_cases', 'UC-002-extra.md'), '# UC-002\n');
  let report = checkSpec(clean);
  assert.equal(report.status, 'drift');
  assert.deepEqual(report.added, ['docs/use_cases/UC-002-extra.md']);

  // changed
  write(path.join(clean, 'docs', 'requirements.md'), '# Requirements\n\n- FR-001: changed.\n');
  report = checkSpec(clean);
  assert.ok(report.changed.includes('docs/requirements.md'));

  // deleted
  fs.rmSync(path.join(clean, 'docs', 'glossary.md'));
  report = checkSpec(clean);
  assert.ok(report.deleted.includes('docs/glossary.md'));

  // draft marker re-introduced
  write(path.join(clean, 'docs', 'requirements.md'), '# Requirements\n\nTODO: still drafting.\n');
  report = checkSpec(clean);
  assert.equal(report.status, 'draft');
  assert.ok(report.draft_markers.some(m => m.path === 'docs/requirements.md'));
});

test('findDraftMarkers is case-insensitive and covers NEEDS CLARIFICATION', () => {
  const root = tmpRoot('markers');
  write(path.join(root, 'docs', 'vision.md'), '# Vision\n\nneeds clarification: scope?\n');
  write(path.join(root, 'docs', 'requirements.md'), '# Requirements\n\nTodo: write more.\n');
  const snap = collectSnapshot(root);
  const markers = findDraftMarkers(snap.files);
  const paths = markers.map(m => m.path).sort();
  assert.deepEqual(paths, ['docs/requirements.md', 'docs/vision.md']);
});

test('parseEvidence rejects malformed evidence and unknown fields', () => {
  assert.throws(() => parseEvidence(null), e => e.code === 'evidence_invalid');
  assert.throws(() => parseEvidence({ checks: [] }), e => e.code === 'evidence_no_checks');
  assert.throws(
    () => parseEvidence({ checks: [{ name: 'a', command: 'x', status: 'ok' }] }),
    e => e.code === 'evidence_invalid_status'
  );
  assert.throws(
    () => parseEvidence({ checks: [{ name: 'a', command: 'x', status: 'passed', log: 'a.log', extra: 1 }] }),
    e => e.code === 'evidence_unknown_field'
  );
  assert.throws(() => parseEvidence({ checks: [{ name: 'a', status: 'passed', log: 'a.log' }] }), e => e.code === 'evidence_invalid');
  assert.throws(
    () =>
      parseEvidence({
        checks: [
          { name: 'dup', command: 'x', status: 'passed', log: 'a.log' },
          { name: 'dup', command: 'y', status: 'failed', log: 'b.log' }
        ]
      }),
    e => e.code === 'evidence_duplicate_name'
  );
  assert.throws(
    () => parseEvidence({ checks: [{ name: 'a', command: 'x', status: 'passed' }] }),
    e => e.code === 'evidence_log_required'
  );
  assert.throws(
    () => parseEvidence({ checks: [{ name: 'a', command: 'x', status: 'not_run' }], unverified: [1] }),
    e => e.code === 'evidence_invalid'
  );
  assert.throws(() => parseEvidence({ checks: [{ name: 'a', command: 'x', status: 'not_run' }], junk: 1 }), e => e.code === 'evidence_unknown_field');

  const ok = parseEvidence({
    checks: [{ name: 'unit', command: 'node --test', status: 'passed', log: 'logs/unit.log' }],
    unverified: ['manual visual check pending']
  });
  assert.equal(ok.checks.length, 1);
  assert.deepEqual(ok.unverified, ['manual visual check pending']);
});

test('packet embeds log digest/body, preserves failed/not_run, and never claims approval', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const logBody = 'test output line 1\nline 2\n';
  write(path.join(root, 'logs', 'unit.log'), logBody);

  const evidenceFile = path.join(root, 'logs', 'evidence.json');
  write(
    evidenceFile,
    JSON.stringify({
      checks: [
        { name: 'unit', command: 'node --test', status: 'passed', log: 'logs/unit.log' },
        { name: 'e2e', command: 'npm run e2e', status: 'failed', log: 'logs/unit.log' },
        { name: 'manual', command: 'do it by hand', status: 'not_run' }
      ],
      unverified: ['business acceptance not reviewed']
    })
  );

  const packet = createReviewPacket(root, evidenceFile);
  assert.equal(packet.schema_version, 1);
  assert.equal(packet.status, 'awaiting_review');
  assert.equal(packet.acceptance, 'not_recorded');
  assert.equal(packet.remote_sync, 'not_attempted');
  assert.equal(packet.evidence.trust, 'reported_untrusted');
  assert.equal(packet.evidence.checks_summary.total, 3);
  assert.equal(packet.evidence.checks_summary.passed, 1);
  assert.equal(packet.evidence.checks_summary.failed, 1);
  assert.equal(packet.evidence.checks_summary.not_run, 1);

  const passed = packet.evidence.checks.find(c => c.name === 'unit');
  assert.equal(passed.status, 'passed');
  assert.equal(passed.log.sha256, sha256(logBody));
  assert.equal(passed.log.bytes, Buffer.byteLength(logBody));
  assert.equal(passed.log.content, logBody);

  const notRun = packet.evidence.checks.find(c => c.name === 'manual');
  assert.equal(notRun.status, 'not_run');
  assert.equal(notRun.log, undefined);

  assert.deepEqual(packet.pin.digest, packet.spec.digest);
  assert.deepEqual(packet.drift, { added: [], changed: [], deleted: [] });
  assert.ok(typeof packet.collected_at === 'string' && packet.collected_at.length > 0);
  assert.ok(packet.limitations.some(l => /not proof of business acceptance/i.test(l)));
  assert.ok(packet.limitations.some(l => /not independently verified/i.test(l)));

  const written = writeReviewPacket(root, packet, {});
  assert.ok(fs.existsSync(written.output));
  assert.throws(() => writeReviewPacket(root, packet, {}), e => e.code === 'output_exists');
  const forced = writeReviewPacket(root, packet, { force: true });
  assert.equal(forced.written, true);
});

test('packet refuses when the pin is missing or the spec drifts', () => {
  const fresh = makeReadyProject();
  const evidence = path.join(fresh, 'evidence.json');
  write(evidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'not_run' }] }));
  assert.throws(() => createReviewPacket(fresh, evidence), e => e.code === 'packet_requires_pin');

  pinSpec(fresh, {});
  write(path.join(fresh, 'docs', 'glossary.md'), '# Glossary\n\n- changed.\n');
  assert.throws(() => createReviewPacket(fresh, evidence), e => e.code === 'packet_requires_sync');
});

test('packet rejects log paths that escape the root or traverse a symlink', () => {
  const root = makeReadyProject();
  pinSpec(root, {});

  const escapeEvidence = path.join(root, 'escape.json');
  write(escapeEvidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'passed', log: '../escape.log' }] }));
  assert.throws(() => createReviewPacket(root, escapeEvidence), e => e.code === 'path_escape');

  const outside = path.join(tmpRoot('outside-log'), 'real.log');
  write(outside, 'secret');
  fs.symlinkSync(outside, path.join(root, 'logs-link.log'));
  const symEvidence = path.join(root, 'sym.json');
  write(symEvidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'passed', log: 'logs-link.log' }] }));
  assert.throws(() => createReviewPacket(root, symEvidence), e => e.code === 'symlink_not_allowed');
});

test('packet rejects an oversized log', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  write(path.join(root, 'logs', 'big.log'), 'x'.repeat(1024 * 1024 + 1));
  const evidence = path.join(root, 'evidence.json');
  write(evidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'passed', log: 'logs/big.log' }] }));
  assert.throws(() => createReviewPacket(root, evidence), e => e.code === 'log_too_large');
});

test('pin snapshots docs/processes/*.bpmn and tracks the optional lint baseline', () => {
  const root = makeReadyProject();
  write(path.join(root, 'docs', 'processes', 'P-001.bpmn'), '<bpmn:definitions/>\n');

  const pinned = pinSpec(root, {});
  const paths = pinned.pin.files.map(f => f.path);
  assert.ok(paths.includes('docs/processes/P-001.bpmn'), 'bpmn is snapshotted');
  assert.equal(pinned.pin.files.find(f => f.path === 'docs/processes/P-001.bpmn').kind, 'process');
  assert.ok(!paths.includes('docs/.spec-lint-baseline.json'), 'absent baseline is not invented');

  // A baseline appearing later must register as drift so suppressed findings cannot slip by.
  write(path.join(root, 'docs', '.spec-lint-baseline.json'), '{"suppressed":[]}\n');
  const report = checkSpec(root);
  assert.equal(report.status, 'drift');
  assert.ok(report.added.includes('docs/.spec-lint-baseline.json'));
});

test('lint baseline is tracked but not scanned for draft markers', () => {
  const root = makeReadyProject();
  write(path.join(root, 'docs', '.spec-lint-baseline.json'), '{"suppressed":[{"rule":"todo-marker"}]}\n');
  const pinned = pinSpec(root, {});
  assert.ok(pinned.pin.files.some(f => f.path === 'docs/.spec-lint-baseline.json'));
});

test('Reviewed status is recorded, not treated as a blocker (no approval claimed)', () => {
  const root = makeReadyProject();
  write(path.join(root, 'docs', 'vision.md'), '# Vision\n\n> Status: Reviewed\n\nContent.\n');
  const pinned = pinSpec(root, {});
  assert.equal(typeof pinned.digest, 'string');
});

test('pin records optional git HEAD and dirty status when inside a repository', t => {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
  } catch {
    t.skip('git is not available');
    return;
  }
  const root = makeReadyProject();
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git(['init']);
  git(['-c', 'user.email=t@example.com', '-c', 'user.name=T', 'add', '-A']);
  git(['-c', 'user.email=t@example.com', '-c', 'user.name=T', 'commit', '-m', 'init', '--no-gpg-sign']);

  const pinned = pinSpec(root, {});
  assert.match(pinned.pin.git.head, /^[0-9a-f]{40}$/);
  assert.equal(pinned.pin.git.dirty, false);

  // git metadata is auxiliary and must not enter the spec digest.
  const withGit = pinSpec(root, {});
  assert.equal(withGit.unchanged, true);
  assert.equal(withGit.pin.spec_digest, pinned.pin.spec_digest);
});

test('check rejects a tampered pin digest and packet refuses to build', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const pin = readPin(root);
  pin.spec_digest = 'a'.repeat(64);
  writePin(root, pin);

  const report = checkSpec(root);
  assert.equal(report.status, 'pin_invalid');
  assert.equal(report.in_sync, false);
  assert.equal(report.error.code, 'pin_digest_mismatch');

  const evidence = path.join(root, 'evidence.json');
  write(evidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'not_run' }] }));
  assert.throws(() => createReviewPacket(root, evidence), e => e.code === 'packet_requires_pin');
});

test('validateStoredPin rejects bad schema, duplicate paths, bad path, hash, bytes, kind, and null files', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const clone = () => JSON.parse(JSON.stringify(readPin(root)));

  const schema = clone();
  schema.schema_version = 2;
  assert.equal(validateStoredPin(schema).code, 'pin_schema_version');

  const dup = clone();
  dup.files.push({ ...dup.files[0] });
  assert.equal(validateStoredPin(dup).code, 'pin_file_duplicate');

  const escape = clone();
  escape.files[0].path = '../escape.md';
  assert.equal(validateStoredPin(escape).code, 'pin_file_path');

  const absolute = clone();
  absolute.files[0].path = '/etc/passwd';
  assert.equal(validateStoredPin(absolute).code, 'pin_file_path');

  const hash = clone();
  hash.files[0].sha256 = 'not-a-hash';
  assert.equal(validateStoredPin(hash).code, 'pin_file_hash');

  const bytes = clone();
  bytes.files[0].bytes = '5';
  assert.equal(validateStoredPin(bytes).code, 'pin_file_bytes');

  const kind = clone();
  kind.files[0].kind = 'evil';
  assert.equal(validateStoredPin(kind).code, 'pin_file_kind');

  const nullFiles = clone();
  nullFiles.files = null;
  assert.equal(validateStoredPin(nullFiles).code, 'pin_files');

  const nullEntry = clone();
  nullEntry.files = [null];
  assert.equal(validateStoredPin(nullEntry).code, 'pin_file_entry');
});

test('check rejects a self-consistent fake pin that omits required or minimum artifacts', () => {
  const root = makeReadyProject();
  pinSpec(root, {});

  const noVision = readPin(root);
  noVision.files = noVision.files.filter(f => f.path !== 'docs/vision.md');
  noVision.spec_digest = computePinDigest(noVision.files);
  writePin(root, noVision);
  assert.equal(checkSpec(root).status, 'pin_invalid');
  assert.equal(checkSpec(root).error.code, 'pin_missing_required');

  pinSpec(root, { refresh: true });
  const noUseCase = readPin(root);
  noUseCase.files = noUseCase.files.filter(f => f.kind !== 'use_case');
  noUseCase.spec_digest = computePinDigest(noUseCase.files);
  writePin(root, noUseCase);
  assert.equal(checkSpec(root).error.code, 'pin_missing_use_case');
});

test('check flags artifacts missing from disk as out of sync', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  fs.rmSync(path.join(root, 'docs', 'glossary.md'));
  const report = checkSpec(root);
  assert.equal(report.in_sync, false);
  assert.equal(report.status, 'drift');
  assert.ok(report.missing_required.includes('docs/glossary.md'));
  assert.ok(report.deleted.includes('docs/glossary.md'));
});

test('pin validates the existing pin instead of trusting a matching digest', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const tampered = readPin(root);
  tampered.spec_digest = 'b'.repeat(64);
  writePin(root, tampered);

  assert.throws(() => pinSpec(root, {}), e => e.code === 'pin_invalid_existing');
  const refreshed = pinSpec(root, { refresh: true });
  assert.equal(refreshed.unchanged, false);
  assert.equal(checkSpec(root).status, 'ok');
});

test('check returns a uniform shape for missing and invalid pins', () => {
  const arrayKeys = ['added', 'changed', 'deleted', 'draft_markers', 'missing_required', 'files'];
  const root = makeReadyProject();
  const missing = checkSpec(root);
  assert.equal(missing.status, 'pin_missing');
  for (const key of arrayKeys) {
    assert.ok(Array.isArray(missing[key]), `${key} is an array when pin is missing`);
  }

  pinSpec(root, {});
  const broken = readPin(root);
  broken.files = null;
  writePin(root, broken);
  const invalid = checkSpec(root);
  assert.equal(invalid.status, 'pin_invalid');
  for (const key of arrayKeys) {
    assert.ok(Array.isArray(invalid[key]), `${key} is an array when pin is invalid`);
  }
});

test('packet marks pin.matched true only within an in-sync spec', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  const evidence = path.join(root, 'evidence.json');
  write(evidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'not_run' }] }));
  const packet = createReviewPacket(root, evidence);
  assert.equal(packet.pin.matched, true);
  assert.equal(packet.spec.digest, packet.pin.digest);
});

test('packet rejects a non-UTF-8 log instead of embedding a misleading body', () => {
  const root = makeReadyProject();
  pinSpec(root, {});
  write(path.join(root, 'logs', 'bin.log'), Buffer.from([0xff, 0xfe, 0x00, 0x41]));
  const evidence = path.join(root, 'evidence.json');
  write(evidence, JSON.stringify({ checks: [{ name: 'c', command: 'x', status: 'passed', log: 'logs/bin.log' }] }));
  assert.throws(() => createReviewPacket(root, evidence), e => e.code === 'log_not_utf8');
});

test('ordinary Todo product names are not unresolved drafting markers', t => {
  const root = tmpRoot('todo-product');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const spec = path.join(root, 'docs/vision.md');
  write(spec, '# Todo Manager\n\nUsers organize a todo list each morning.\n');
  assert.deepEqual(findDraftMarkers(collectSnapshot(root).files), []);
  for (const marker of ['TODO: Define scope', '[TODO]', '[TODO describe the outcome]', '- TODO']) {
    write(spec, `# Vision\n\n${marker}\n`);
    assert.equal(findDraftMarkers(collectSnapshot(root).files).length, 1, marker);
  }
});

test('folder notes do not satisfy the required UC and TC minimums', t => {
  const root = makeReadyProject();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const uc = path.join(root, 'docs/use_cases/UC-001-do-thing.md');
  const tc = path.join(root, 'docs/test_cases/TC-001-do-thing.md');
  fs.unlinkSync(uc);
  write(path.join(root, 'docs/use_cases/README.md'), '# Notes\n');
  assert.throws(() => pinSpec(root), error => error.code === 'insufficient_use_cases');
  write(uc, '# UC-001\n');
  fs.unlinkSync(tc);
  write(path.join(root, 'docs/test_cases/README.md'), '# Notes\n');
  assert.throws(() => pinSpec(root), error => error.code === 'insufficient_test_cases');
});
