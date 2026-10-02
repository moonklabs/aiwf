/**
 * AIWF spec workflow - bounded local snapshot / pin / check / review-packet logic.
 *
 * Built-in Node modules only. This module records byte-level snapshots. It does not
 * execute recorded commands and it never asserts approval, verification, or done states.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const SCHEMA_VERSION = 1;

// Caps the embedded evidence log size so review packets stay reviewable.
export const LOG_MAX_BYTES = 1024 * 1024;

export const REQUIRED_SPEC_FILES = [
  'docs/vision.md',
  'docs/requirements.md',
  'docs/glossary.md',
  'docs/entity_model.md',
  'docs/use_cases.puml'
];

// Spec directories scanned for additional artifacts, mapped to their kind and extensions.
export const SPEC_DIRS = {
  'docs/use_cases': { kind: 'use_case', extensions: ['.md'] },
  'docs/test_cases': { kind: 'test_case', extensions: ['.md'] },
  'docs/architecture': { kind: 'architecture', extensions: ['.md'] },
  'docs/plans': { kind: 'plan', extensions: ['.md'] },
  'docs/processes': { kind: 'process', extensions: ['.bpmn'] }
};

// Individually tracked optional spec files. The lint baseline is tracked so that suppressed
// findings cannot change underneath a pin without registering as drift.
export const OPTIONAL_SPEC_FILES = [
  { path: 'docs/.spec-lint-baseline.json', kind: 'lint_baseline' }
];

export const EVIDENCE_STATUSES = ['passed', 'failed', 'not_run'];

// Kinds a stored pin manifest may legitimately contain.
const ALLOWED_KINDS = new Set([
  'required',
  'use_case',
  'test_case',
  'architecture',
  'plan',
  'process',
  'lint_baseline'
]);

const HEX64 = /^[0-9a-f]{64}$/;

export const LIMITATIONS = [
  'Recorded check output is not proof of business acceptance.',
  'Check statuses are reported by the submitter and are not independently verified by this tool.',
  'Remote synchronization was not attempted.',
  'Human acceptance has not been recorded.',
  'Structural and semantic lint is not performed by this tool; it remains an upstream step.'
];

export class SpecError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SpecError';
    this.code = code;
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function sha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function safeLstat(target) {
  try {
    return fs.lstatSync(target);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

function isInsideRoot(root, target) {
  const rel = path.relative(root, target);
  if (rel === '') {
    return true;
  }
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

function assertInsideRoot(root, target) {
  if (!isInsideRoot(root, target)) {
    throw new SpecError('path_escape', `Path escapes root: ${toPosix(path.relative(root, target))}`);
  }
}

// Walk every component strictly below `root` and reject symlinks so artifacts cannot escape.
function assertNoSymlink(root, target) {
  const rel = path.relative(root, target);
  if (rel === '') {
    return;
  }
  let current = root;
  for (const part of rel.split(path.sep)) {
    current = path.join(current, part);
    const stat = safeLstat(current);
    if (!stat) {
      return;
    }
    if (stat.isSymbolicLink()) {
      throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${toPosix(path.relative(root, current))}`);
    }
  }
}

function assertRootDirectory(root) {
  const stat = safeLstat(root);
  if (!stat || !stat.isDirectory()) {
    throw new SpecError('root_not_found', `Root is not an existing directory: ${root}`);
  }
}

function hashFile(absPath, relPath, kind) {
  const buffer = fs.readFileSync(absPath);
  return {
    abs: absPath,
    path: toPosix(relPath),
    sha256: sha256Hex(buffer),
    bytes: buffer.length,
    kind
  };
}

function listArtifactsInDir(root, relDir, kind, extensions) {
  const absDir = path.join(root, relDir);
  assertNoSymlink(root, absDir);
  const stat = safeLstat(absDir);
  if (!stat) {
    return [];
  }
  if (stat.isSymbolicLink()) {
    throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${relDir}`);
  }
  if (!stat.isDirectory()) {
    throw new SpecError('artifact_not_directory', `Expected a directory: ${relDir}`);
  }

  const found = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const entryStat = fs.lstatSync(abs);
      const rel = toPosix(path.relative(root, abs));
      if (entryStat.isSymbolicLink()) {
        throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${rel}`);
      }
      if (entryStat.isDirectory()) {
        walk(abs);
      } else if (entryStat.isFile() && extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        found.push(hashFile(abs, rel, kind));
      }
    }
  };
  walk(absDir);
  return found;
}

function sortByPath(a, b) {
  if (a.path < b.path) {
    return -1;
  }
  if (a.path > b.path) {
    return 1;
  }
  return 0;
}

function isIdentifiedArtifact(file, kind) {
  const pattern = kind === 'use_case' ? /^[SB]?UC-.+\.md$/ : /^TC-.+\.md$/;
  return file.kind === kind && pattern.test(path.posix.basename(file.path));
}

/**
 * Collect deterministic byte SHA256 snapshots of all spec artifacts under `root`.
 * Returns files sorted by posix relative path plus counts and missing required files.
 */
export function collectSnapshot(root, options = {}) {
  const absRoot = path.resolve(root);
  const files = [];
  const missingRequired = [];

  for (const rel of REQUIRED_SPEC_FILES) {
    const abs = path.join(absRoot, rel);
    assertInsideRoot(absRoot, abs);
    assertNoSymlink(absRoot, abs);
    const stat = safeLstat(abs);
    if (!stat) {
      missingRequired.push(rel);
      continue;
    }
    if (stat.isSymbolicLink()) {
      throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${rel}`);
    }
    if (!stat.isFile()) {
      throw new SpecError('artifact_not_file', `Expected a file: ${rel}`);
    }
    files.push(hashFile(abs, rel, 'required'));
  }

  for (const [relDir, config] of Object.entries(SPEC_DIRS)) {
    files.push(...listArtifactsInDir(absRoot, relDir, config.kind, config.extensions));
  }

  for (const optional of OPTIONAL_SPEC_FILES) {
    const abs = path.join(absRoot, optional.path);
    assertInsideRoot(absRoot, abs);
    assertNoSymlink(absRoot, abs);
    const stat = safeLstat(abs);
    if (!stat) {
      continue;
    }
    if (stat.isSymbolicLink()) {
      throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${optional.path}`);
    }
    if (stat.isFile()) {
      files.push(hashFile(abs, optional.path, optional.kind));
    }
  }

  files.sort(sortByPath);

  const useCaseCount = files.filter(f => isIdentifiedArtifact(f, 'use_case')).length;
  const testCaseCount = files.filter(f => isIdentifiedArtifact(f, 'test_case')).length;

  if (options.enforceMinimums && missingRequired.length > 0) {
    throw new SpecError(
      'missing_required',
      `Missing required spec files: ${missingRequired.join(', ')}`
    );
  }

  return { root: absRoot, files, missingRequired, useCaseCount, testCaseCount };
}

/**
 * Stable digest over canonical path + content-hash pairs, sorted by path.
 */
export function computePinDigest(files) {
  const canonical = [...files]
    .sort(sortByPath)
    .map(f => `${f.path}\u0000${f.sha256}`)
    .join('\n');
  return sha256Hex(Buffer.from(canonical, 'utf8'));
}

/**
 * Detect draft markers (case-insensitive) that must block pinning.
 */
export function findDraftMarkers(files) {
  const results = [];
  for (const file of files) {
    // Authored spec content only: the lint baseline is machine data, not a spec statement.
    if (file.kind === 'lint_baseline') {
      continue;
    }
    const text = fs.readFileSync(file.abs, 'utf8');
    const markers = [];
    // Explicit drafting syntax only; a product named "Todo Manager" is valid prose.
    if (/(?:^|[^A-Za-z0-9])todo\s*:/i.test(text) ||
        /\[todo(?:\s|\])/i.test(text) ||
        /^\s*(?:[-*]\s+)?todo\s*$/im.test(text)) {
      markers.push('TODO');
    }
    if (/needs[\s_-]*clarification/i.test(text)) {
      markers.push('NEEDS CLARIFICATION');
    }
    if (markers.length > 0) {
      results.push({ path: file.path, markers });
    }
  }
  return results;
}

/**
 * Best-effort git HEAD + dirty status. Returns null when the location is not a usable repo.
 * Uses only node built-ins; never throws.
 */
export function readGitInfo(root) {
  const run = args =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
  try {
    const head = run(['rev-parse', 'HEAD']).trim();
    if (!head) {
      return null;
    }
    let dirty = null;
    try {
      dirty = run(['status', '--porcelain']).trim().length > 0;
    } catch {
      dirty = null;
    }
    return { head, dirty };
  } catch {
    return null;
  }
}

const PIN_DIR = '.aiwf';
const PIN_FILE = 'spec-pin.json';

function pinPathFor(root) {
  return path.join(root, PIN_DIR, PIN_FILE);
}

function buildPin(files, digest, git) {
  const pin = {
    schema_version: SCHEMA_VERSION,
    spec_digest: digest
  };
  // Git context is auxiliary metadata and is intentionally excluded from spec_digest.
  if (git) {
    pin.git = git;
  }
  pin.files = files.map(f => ({ path: f.path, sha256: f.sha256, bytes: f.bytes, kind: f.kind }));
  return pin;
}

function publicFile(file) {
  return { path: file.path, sha256: file.sha256, bytes: file.bytes, kind: file.kind };
}

function invalidPin(code, message) {
  return { valid: false, code, message };
}

// Stored paths must be canonical, relative, posix, and traversal-free.
function isCanonicalRelativePath(candidate) {
  if (typeof candidate !== 'string' || candidate === '') {
    return false;
  }
  if (candidate.includes('\\') || candidate.startsWith('/') || candidate.startsWith('./')) {
    return false;
  }
  if (path.posix.isAbsolute(candidate)) {
    return false;
  }
  const segments = candidate.split('/');
  if (segments.some(segment => segment === '' || segment === '.' || segment === '..')) {
    return false;
  }
  return path.posix.normalize(candidate) === candidate;
}

/**
 * Strictly validate a stored pin. Returns { valid: true, files } or { valid: false, code, message }.
 * A pin that omits required artifacts, minimum use/test cases, or whose manifest no longer
 * matches its own spec_digest is treated as malformed rather than trusted.
 */
export function validateStoredPin(pin) {
  if (pin === null || typeof pin !== 'object' || Array.isArray(pin)) {
    return invalidPin('pin_shape', 'Pin must be a JSON object.');
  }
  if (pin.schema_version !== SCHEMA_VERSION) {
    return invalidPin('pin_schema_version', `Unsupported pin schema_version: ${String(pin.schema_version)}`);
  }
  if (typeof pin.spec_digest !== 'string' || !HEX64.test(pin.spec_digest)) {
    return invalidPin('pin_digest_format', 'Pin spec_digest must be a 64-character hex string.');
  }
  if (!Array.isArray(pin.files) || pin.files.length === 0) {
    return invalidPin('pin_files', 'Pin files must be a non-empty array.');
  }
  if (pin.git !== undefined) {
    if (pin.git === null || typeof pin.git !== 'object' || Array.isArray(pin.git)) {
      return invalidPin('pin_git', 'Pin git metadata must be an object when present.');
    }
    if (typeof pin.git.head !== 'string' || !/^[0-9a-f]{7,40}$/.test(pin.git.head)) {
      return invalidPin('pin_git', 'Pin git.head must be a hex commit id.');
    }
    if (pin.git.dirty !== null && typeof pin.git.dirty !== 'boolean') {
      return invalidPin('pin_git', 'Pin git.dirty must be a boolean or null.');
    }
  }

  const seen = new Set();
  const snapshots = [];
  for (const file of pin.files) {
    if (file === null || typeof file !== 'object' || Array.isArray(file)) {
      return invalidPin('pin_file_entry', 'Each pin file entry must be an object.');
    }
    if (!isCanonicalRelativePath(file.path)) {
      return invalidPin('pin_file_path', `Pin file path is not a safe canonical relative path: ${String(file.path)}`);
    }
    if (seen.has(file.path)) {
      return invalidPin('pin_file_duplicate', `Duplicate pin file path: ${file.path}`);
    }
    seen.add(file.path);
    if (typeof file.sha256 !== 'string' || !HEX64.test(file.sha256)) {
      return invalidPin('pin_file_hash', `Pin file hash must be a 64-character hex string: ${file.path}`);
    }
    if (!Number.isInteger(file.bytes) || file.bytes < 0) {
      return invalidPin('pin_file_bytes', `Pin file bytes must be a non-negative integer: ${file.path}`);
    }
    if (!ALLOWED_KINDS.has(file.kind)) {
      return invalidPin('pin_file_kind', `Pin file kind is not allowed: ${String(file.kind)}`);
    }
    snapshots.push({ path: file.path, sha256: file.sha256, bytes: file.bytes, kind: file.kind });
  }

  const byPath = new Map(snapshots.map(file => [file.path, file]));
  for (const required of REQUIRED_SPEC_FILES) {
    const entry = byPath.get(required);
    if (!entry) {
      return invalidPin('pin_missing_required', `Pin is missing required artifact: ${required}`);
    }
    if (entry.kind !== 'required') {
      return invalidPin('pin_required_kind', `Pin kind for ${required} must be 'required'.`);
    }
  }
  if (!snapshots.some(file => isIdentifiedArtifact(file, 'use_case'))) {
    return invalidPin('pin_missing_use_case', 'Pin manifest has no use_case artifact.');
  }
  if (!snapshots.some(file => isIdentifiedArtifact(file, 'test_case'))) {
    return invalidPin('pin_missing_test_case', 'Pin manifest has no test_case artifact.');
  }

  if (computePinDigest(snapshots) !== pin.spec_digest) {
    return invalidPin('pin_digest_mismatch', 'Pin spec_digest does not match its file manifest.');
  }

  return { valid: true, files: snapshots };
}

function readExistingPin(root) {
  const pinPath = pinPathFor(root);
  assertNoSymlink(root, path.join(root, PIN_DIR));
  assertNoSymlink(root, pinPath);
  const stat = safeLstat(pinPath);
  if (!stat) {
    return { exists: false, pinPath };
  }
  if (stat.isSymbolicLink()) {
    throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${PIN_DIR}/${PIN_FILE}`);
  }
  let parsed = null;
  let text = null;
  try {
    text = fs.readFileSync(pinPath, 'utf8');
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  return { exists: true, pinPath, text, pin: parsed };
}

/**
 * Pin the current spec snapshot. Refuses to overwrite an existing, differing pin
 * unless `refresh` is true. Identical content is idempotent.
 */
export function pinSpec(root, options = {}) {
  const absRoot = path.resolve(root);
  assertRootDirectory(absRoot);
  assertNoSymlink(absRoot, path.join(absRoot, PIN_DIR));
  assertNoSymlink(absRoot, path.join(absRoot, 'docs'));

  const snapshot = collectSnapshot(absRoot, { enforceMinimums: true });

  const markers = findDraftMarkers(snapshot.files);
  if (markers.length > 0) {
    const detail = markers.map(m => `${m.path} (${m.markers.join(', ')})`).join('; ');
    throw new SpecError('draft_markers', `Draft markers block pinning: ${detail}`);
  }

  if (snapshot.useCaseCount < 1) {
    throw new SpecError(
      'insufficient_use_cases',
      'At least one use case markdown file is required under docs/use_cases before pinning.'
    );
  }
  if (snapshot.testCaseCount < 1) {
    throw new SpecError(
      'insufficient_test_cases',
      'At least one test case markdown file is required under docs/test_cases before pinning.'
    );
  }

  const digest = computePinDigest(snapshot.files);
  const git = readGitInfo(absRoot);
  const pin = buildPin(snapshot.files, digest, git);
  const existing = readExistingPin(absRoot);

  if (existing.exists) {
    const validation = validateStoredPin(existing.pin);
    if (!validation.valid) {
      if (!options.refresh) {
        throw new SpecError(
          'pin_invalid_existing',
          `Existing pin is invalid (${validation.code}); use --refresh to replace it.`
        );
      }
    } else if (existing.pin.spec_digest === digest) {
      return { command: 'pin', root: absRoot, unchanged: true, pin, digest };
    } else if (!options.refresh) {
      throw new SpecError('pin_exists', 'A different pin already exists; re-run with --refresh to overwrite it.');
    }
  }

  fs.mkdirSync(path.join(absRoot, PIN_DIR), { recursive: true });
  assertNoSymlink(absRoot, pinPathFor(absRoot));
  fs.writeFileSync(existing.pinPath, `${JSON.stringify(pin, null, 2)}\n`);

  return { command: 'pin', root: absRoot, unchanged: false, pin, digest };
}

function compareSnapshots(pin, snapshot) {
  const pinnedByPath = new Map(pin.files.map(f => [f.path, f]));
  const currentByPath = new Map(snapshot.files.map(f => [f.path, f]));

  const added = [];
  const changed = [];
  const deleted = [];

  for (const [filePath, file] of currentByPath) {
    const previous = pinnedByPath.get(filePath);
    if (!previous) {
      added.push(filePath);
    } else if (previous.sha256 !== file.sha256) {
      changed.push(filePath);
    }
  }
  for (const filePath of pinnedByPath.keys()) {
    if (!currentByPath.has(filePath)) {
      deleted.push(filePath);
    }
  }

  return { added: added.sort(), changed: changed.sort(), deleted: deleted.sort() };
}

/**
 * Compare the pinned manifest to the current snapshot. Read-only.
 */
export function checkSpec(root) {
  const absRoot = path.resolve(root);
  assertRootDirectory(absRoot);

  // Uniform shape so callers can read array fields regardless of pin state.
  const base = {
    command: 'check',
    root: absRoot,
    in_sync: false,
    pin_digest: null,
    current_digest: null,
    digest_matches: false,
    added: [],
    changed: [],
    deleted: [],
    draft_markers: [],
    missing_required: [],
    use_case_count: 0,
    test_case_count: 0,
    files: [],
    git: null
  };

  const existing = readExistingPin(absRoot);
  if (!existing.exists) {
    return { ...base, status: 'pin_missing' };
  }

  const validation = validateStoredPin(existing.pin);
  if (!validation.valid) {
    return { ...base, status: 'pin_invalid', error: { code: validation.code, message: validation.message } };
  }
  const pin = existing.pin;

  const snapshot = collectSnapshot(absRoot);
  const drift = compareSnapshots(pin, snapshot);
  const draftMarkers = findDraftMarkers(snapshot.files);
  const currentDigest = computePinDigest(snapshot.files);
  const digestMatches = currentDigest === pin.spec_digest;
  const minimumsOk = snapshot.useCaseCount >= 1 && snapshot.testCaseCount >= 1;
  const hasDrift = drift.added.length > 0 || drift.changed.length > 0 || drift.deleted.length > 0;
  const inSync =
    digestMatches &&
    !hasDrift &&
    snapshot.missingRequired.length === 0 &&
    minimumsOk &&
    draftMarkers.length === 0;

  let status = 'ok';
  if (!inSync) {
    status = draftMarkers.length > 0 ? 'draft' : 'drift';
  }

  return {
    ...base,
    status,
    in_sync: inSync,
    pin_digest: pin.spec_digest,
    current_digest: currentDigest,
    digest_matches: digestMatches,
    added: drift.added,
    changed: drift.changed,
    deleted: drift.deleted,
    draft_markers: draftMarkers,
    missing_required: snapshot.missingRequired,
    use_case_count: snapshot.useCaseCount,
    test_case_count: snapshot.testCaseCount,
    files: snapshot.files.map(publicFile),
    git: readGitInfo(absRoot)
  };
}

function validateEvidenceShape(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new SpecError('evidence_invalid', 'Evidence must be a JSON object.');
  }
  const allowedTop = new Set(['checks', 'unverified']);
  for (const key of Object.keys(raw)) {
    if (!allowedTop.has(key)) {
      throw new SpecError('evidence_unknown_field', `Unknown evidence field: ${key}`);
    }
  }
  if (!Array.isArray(raw.checks)) {
    throw new SpecError('evidence_invalid', 'evidence.checks must be an array.');
  }
  if (raw.checks.length < 1) {
    throw new SpecError('evidence_no_checks', 'At least one check is required.');
  }
  if (raw.unverified !== undefined && !Array.isArray(raw.unverified)) {
    throw new SpecError('evidence_invalid', 'evidence.unverified must be an array of strings.');
  }
  const unverified = raw.unverified === undefined ? [] : raw.unverified;
  for (const entry of unverified) {
    if (typeof entry !== 'string') {
      throw new SpecError('evidence_invalid', 'evidence.unverified entries must be strings.');
    }
  }

  const allowedCheck = new Set(['name', 'command', 'status', 'log']);
  const names = new Set();
  const checks = raw.checks.map(check => {
    if (check === null || typeof check !== 'object' || Array.isArray(check)) {
      throw new SpecError('evidence_invalid', 'Each check must be an object.');
    }
    for (const key of Object.keys(check)) {
      if (!allowedCheck.has(key)) {
        throw new SpecError('evidence_unknown_field', `Unknown check field: ${key}`);
      }
    }
    if (typeof check.name !== 'string' || check.name.trim() === '') {
      throw new SpecError('evidence_invalid', 'Each check requires a non-empty name.');
    }
    if (typeof check.command !== 'string' || check.command.trim() === '') {
      throw new SpecError('evidence_invalid', 'Each check requires a non-empty command string.');
    }
    if (!EVIDENCE_STATUSES.includes(check.status)) {
      throw new SpecError('evidence_invalid_status', `Invalid check status: ${String(check.status)}`);
    }
    if (names.has(check.name)) {
      throw new SpecError('evidence_duplicate_name', `Duplicate check name: ${check.name}`);
    }
    names.add(check.name);

    const executed = check.status === 'passed' || check.status === 'failed';
    if (executed) {
      if (typeof check.log !== 'string' || check.log.trim() === '') {
        throw new SpecError('evidence_log_required', `Executed check '${check.name}' requires a log path.`);
      }
    } else if (check.log !== undefined && typeof check.log !== 'string') {
      throw new SpecError('evidence_invalid', `Check '${check.name}' log must be a string.`);
    }

    return { name: check.name, command: check.command, status: check.status, log: check.log };
  });

  return { checks, unverified };
}

/**
 * Validate parsed evidence JSON without touching the filesystem.
 */
export function parseEvidence(raw) {
  return validateEvidenceShape(raw);
}

function readEvidenceFile(evidencePath, cwd) {
  const abs = path.resolve(cwd || process.cwd(), evidencePath);
  const stat = safeLstat(abs);
  if (!stat) {
    throw new SpecError('evidence_missing', `Evidence file not found: ${evidencePath}`);
  }
  if (stat.isSymbolicLink()) {
    throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${evidencePath}`);
  }
  if (!stat.isFile()) {
    throw new SpecError('evidence_invalid', `Evidence path is not a file: ${evidencePath}`);
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (err) {
    throw new SpecError('evidence_invalid_json', `Evidence is not valid JSON: ${err.message}`);
  }
  return { abs, evidence: validateEvidenceShape(raw) };
}

function readLogWithinRoot(root, relLog) {
  const abs = path.resolve(root, relLog);
  assertInsideRoot(root, abs);
  assertNoSymlink(root, abs);
  const stat = safeLstat(abs);
  if (!stat) {
    throw new SpecError('log_missing', `Log file not found: ${relLog}`);
  }
  if (stat.isSymbolicLink()) {
    throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${relLog}`);
  }
  if (!stat.isFile()) {
    throw new SpecError('log_not_file', `Log path is not a file: ${relLog}`);
  }
  if (stat.size > LOG_MAX_BYTES) {
    throw new SpecError('log_too_large', `Log exceeds ${LOG_MAX_BYTES} bytes: ${relLog}`);
  }
  const buffer = fs.readFileSync(abs);
  const content = buffer.toString('utf8');
  // Guarantee the embedded body is byte-exact; non-UTF-8 logs are rejected rather than mangled.
  if (!Buffer.from(content, 'utf8').equals(buffer)) {
    throw new SpecError('log_not_utf8', `Log is not valid UTF-8 and cannot be embedded exactly: ${relLog}`);
  }
  return {
    path: toPosix(path.relative(root, abs)),
    sha256: sha256Hex(buffer),
    bytes: buffer.length,
    content
  };
}

/**
 * Build a local review packet. Refuses when the pin is missing, invalid, or drifted.
 * Evidence statuses are recorded as reported, never as independently verified.
 */
export function createReviewPacket(root, evidencePath, options = {}) {
  const absRoot = path.resolve(root);
  const check = checkSpec(absRoot);

  if (check.status === 'pin_missing' || check.status === 'pin_invalid') {
    throw new SpecError('packet_requires_pin', 'A valid pin is required before building a review packet.');
  }
  if (check.status !== 'ok') {
    throw new SpecError(
      'packet_requires_sync',
      `Spec is not in sync (status: ${check.status}); refresh the pin before building a review packet.`
    );
  }

  const { evidence } = readEvidenceFile(evidencePath, options.cwd);

  const checks = evidence.checks.map(checkEntry => {
    const record = { name: checkEntry.name, command: checkEntry.command, status: checkEntry.status };
    if (checkEntry.log !== undefined) {
      record.log = readLogWithinRoot(absRoot, checkEntry.log);
    }
    return record;
  });

  const summary = { total: checks.length, passed: 0, failed: 0, not_run: 0 };
  for (const entry of checks) {
    summary[entry.status] += 1;
  }

  return {
    schema_version: SCHEMA_VERSION,
    collected_at: new Date().toISOString(),
    status: 'awaiting_review',
    acceptance: 'not_recorded',
    remote_sync: 'not_attempted',
    spec: {
      digest: check.current_digest,
      files: check.files.map(f => ({ path: f.path, sha256: f.sha256, bytes: f.bytes, kind: f.kind }))
    },
    pin: {
      digest: check.pin_digest,
      matched: check.pin_digest === check.current_digest
    },
    drift: { added: check.added, changed: check.changed, deleted: check.deleted },
    git: check.git || null,
    evidence: {
      trust: 'reported_untrusted',
      checks_summary: summary,
      checks,
      unverified: evidence.unverified
    },
    limitations: [...LIMITATIONS]
  };
}

/**
 * Write a review packet to disk. Refuses to overwrite an existing file unless `force`.
 */
export function writeReviewPacket(root, packet, options = {}) {
  const absRoot = path.resolve(root);
  const cwd = options.cwd || process.cwd();
  const output = options.output
    ? path.resolve(cwd, options.output)
    : path.join(absRoot, PIN_DIR, 'review-packet.json');

  // The review packet is a local artifact: keep it inside the project root so it cannot
  // be written through an escaping or symlinked path.
  if (output === absRoot || !isInsideRoot(absRoot, output)) {
    throw new SpecError('output_outside_root', `Packet output must stay inside the project root: ${output}`);
  }
  assertNoSymlink(absRoot, output);

  const existing = safeLstat(output);
  if (existing) {
    if (existing.isSymbolicLink()) {
      throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${output}`);
    }
    if (!existing.isFile()) {
      throw new SpecError('output_not_file', `Packet output exists and is not a regular file: ${output}`);
    }
    if (!options.force) {
      throw new SpecError('output_exists', `Refusing to overwrite existing packet: ${output} (use --force)`);
    }
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
  return { output, written: true };
}

/**
 * Initialize minimal AIUP-compatible Draft specs without overwriting user files.
 */
export function initSpec(root, name) {
  const absRoot = path.resolve(root);
  assertRootDirectory(absRoot);
  const title = typeof name === 'string' && name.trim() !== '' ? name : path.basename(absRoot);

  const docsDir = path.join(absRoot, 'docs');
  assertNoSymlink(absRoot, docsDir);
  const docsStat = safeLstat(docsDir);
  if (docsStat && !docsStat.isDirectory()) {
    throw new SpecError('artifact_not_directory', 'docs exists and is not a directory.');
  }
  fs.mkdirSync(docsDir, { recursive: true });

  const useCasesDir = path.join(docsDir, 'use_cases');
  const testCasesDir = path.join(docsDir, 'test_cases');
  for (const dir of [useCasesDir, testCasesDir]) {
    assertNoSymlink(absRoot, dir);
    const stat = safeLstat(dir);
    if (stat && stat.isSymbolicLink()) {
      throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${toPosix(path.relative(absRoot, dir))}`);
    }
    if (stat && !stat.isDirectory()) {
      throw new SpecError('artifact_not_directory', `Expected a directory: ${toPosix(path.relative(absRoot, dir))}`);
    }
    fs.mkdirSync(dir, { recursive: true });
  }

  const templates = new Map([
    ['docs/vision.md', templateVision(title)],
    ['docs/requirements.md', templateRequirements()],
    ['docs/glossary.md', templateGlossary()],
    ['docs/entity_model.md', templateEntityModel()],
    ['docs/use_cases.puml', templateUseCasesPuml()]
  ]);

  const created = [];
  const preserved = [];

  for (const [rel, content] of templates) {
    const abs = path.join(absRoot, rel);
    assertNoSymlink(absRoot, abs);
    const stat = safeLstat(abs);
    if (stat) {
      if (stat.isSymbolicLink()) {
        throw new SpecError('symlink_not_allowed', `Symlink not allowed: ${rel}`);
      }
      preserved.push(rel);
      continue;
    }
    fs.writeFileSync(abs, content);
    created.push(rel);
  }

  for (const rel of ['docs/use_cases', 'docs/test_cases']) {
    preserved.push(rel);
  }

  return { command: 'init', root: absRoot, name: title, created, preserved };
}

function templateVision(title) {
  return [
    '# Vision',
    '',
    '> Status: Draft',
    '',
    '## Product',
    '',
    title,
    '',
    '## Problem',
    '',
    'TODO: Describe the user problem this product solves.',
    '',
    '## Outcome',
    '',
    'TODO: Describe the measurable outcome.',
    '',
    '## Non-Goals',
    '',
    'TODO: List what is explicitly out of scope.',
    ''
  ].join('\n');
}

function templateRequirements() {
  return [
    '# Requirements',
    '',
    '> Status: Draft',
    '',
    '## Functional Requirements',
    '',
    '- TODO: FR-001 Describe a required behavior.',
    '',
    '## Non-Functional Requirements',
    '',
    '- TODO: NFR-001 Describe a quality constraint.',
    ''
  ].join('\n');
}

function templateGlossary() {
  return [
    '# Glossary',
    '',
    '> Status: Draft',
    '',
    '- TODO: term - definition.',
    ''
  ].join('\n');
}

function templateEntityModel() {
  return [
    '# Entity Model',
    '',
    '> Status: Draft',
    '',
    '## Entities',
    '',
    '- TODO: Entity - fields and relationships.',
    ''
  ].join('\n');
}

function templateUseCasesPuml() {
  return [
    '@startuml',
    "' Status: Draft",
    "' TODO: Model actors and use cases before pinning.",
    '@enduml',
    ''
  ].join('\n');
}
