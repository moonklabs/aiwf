import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { selectSkillBundles, stageSkillBundles } from './skill-bundles.js';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const packageInfo = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const require = createRequire(import.meta.url);
export const supportedAgents = ['codex', 'claude-code'];

function fail(message, details) {
  const error = new Error(message);
  error.code = 'skill_installation';
  if (details) { error.details = details; }
  throw error;
}

function present(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') { return undefined; } throw error; }
}

function safeParents(path) {
  for (let current = resolve(path); ; current = dirname(current)) {
    const info = present(current);
    if (info && (info.isSymbolicLink() || !info.isDirectory())) {
      fail(`Expected a directory without symbolic links: ${current}`);
    }
    if (current === dirname(current)) { break; }
  }
}

export function treeDigest(directory) {
  const hash = createHash('sha256');
  function visit(current, prefix = '') {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '__pycache__' || entry.name.endsWith('.pyc') || entry.name === '.DS_Store') { continue; }
      const path = join(current, entry.name);
      const name = prefix + entry.name;
      if (entry.isSymbolicLink()) { fail(`Refusing symbolic link: ${path}`); }
      if (entry.isDirectory()) { visit(path, name + '/'); }
      else if (entry.isFile()) {
        const bytes = readFileSync(path);
        hash.update(JSON.stringify([name, bytes.length])).update('\0').update(bytes).update('\0');
      } else { fail(`Expected a regular resource file: ${path}`); }
    }
  }
  visit(directory);
  return hash.digest('hex');
}

function scopePaths({ project = process.cwd(), global = false, home = homedir() }) {
  const requested = resolve(global ? home : project);
  const infoRoot = present(requested);
  if (!infoRoot?.isDirectory() || infoRoot.isSymbolicLink()) { fail(`Expected an existing directory: ${requested}`); }
  const root = realpathSync(requested);
  safeParents(root);
  const state = join(root, '.aiwf');
  safeParents(state);
  const receipt = join(state, 'skills-installation.json');
  const info = present(receipt);
  if (info && (info.isSymbolicLink() || !info.isFile())) { fail(`Expected a regular installation record: ${receipt}`); }
  return { root, state, receipt, scope: global ? 'user' : 'project' };
}

export function skillDestination(root, agent, global, name, claudeConfigDir = process.env.CLAUDE_CONFIG_DIR) {
  if (!supportedAgents.includes(agent) || !/^aiwf-[a-z0-9-]+$/.test(name)) { fail('Invalid agent or installed skill name.'); }
  // These paths follow the pinned skills CLI adapter, not native plugin caches.
  let base = agent === 'claude-code' ? global && claudeConfigDir ? resolve(claudeConfigDir) : join(root, '.claude') : join(root, '.agents');
  if (agent === 'claude-code' && global && claudeConfigDir) {
    // Resolve OS aliases above the explicitly selected config root (e.g. macOS /var).
    let parent = dirname(base);
    while (!present(parent)) { parent = dirname(parent); }
    base = join(realpathSync(parent), relative(parent, base));
  }
  return join(base, 'skills', name);
}

function readReceipt(path) {
  if (!existsSync(path)) { return { schema_version: 1, installations: [] }; }
  let value;
  try { value = JSON.parse(readFileSync(path, 'utf8')); }
  catch { fail(`Invalid installation record: ${path}`); }
  if (value.schema_version !== 1 || !Array.isArray(value.installations)) { fail(`Unsupported installation record: ${path}`); }
  const seen = new Set();
  for (const item of value.installations) {
    if (!item || typeof item !== 'object') { fail(`Invalid installation entry: ${path}`); }
    const key = `${item.agent}:${item.name}`;
    if (!supportedAgents.includes(item.agent) || !/^aiwf-[a-z0-9-]+$/.test(item.name) || seen.has(key)
      || !/^[a-f0-9]{64}$/.test(item.digest) || !/^[a-f0-9]{64}$/.test(item.source_digest)
      || typeof item.plugin !== 'string' || typeof item.plugin_version !== 'string' || typeof item.destination !== 'string') {
      fail(`Invalid installation entry: ${path}`);
    }
    seen.add(key);
  }
  return value;
}

function checkSkillsLock(paths) {
  if (paths.scope !== 'project') { return; }
  const path = join(paths.root, 'skills-lock.json');
  const info = present(path);
  if (!info) { return; }
  if (info.isSymbolicLink() || !info.isFile()) { fail(`Expected a regular skills lockfile: ${path}`); }
  let lock;
  try { lock = JSON.parse(readFileSync(path, 'utf8')); } catch { fail(`Invalid skills lockfile: ${path}`); }
  if (lock?.version !== 1 || !lock.skills || typeof lock.skills !== 'object' || Array.isArray(lock.skills)) {
    fail(`Unsupported skills lockfile; preserve and review it before installing: ${path}`);
  }
}

export function planSkillInstallation(options = {}) {
  const paths = scopePaths(options);
  checkSkillsLock(paths);
  const agents = [...new Set(options.agents ?? [])];
  if (!agents.length || agents.some(agent => !supportedAgents.includes(agent))) {
    fail(`Choose an agent: ${supportedAgents.join(', ')}`);
  }
  const bundles = selectSkillBundles(options);
  const receipt = readReceipt(paths.receipt);
  const items = [];
  for (const bundle of bundles) {
    const sourceDigest = treeDigest(resolve(packageRoot, 'plugins', bundle.name));
    for (const skill of bundle.skills) {
      for (const agent of agents) {
        const destination = skillDestination(paths.root, agent, options.global, skill.installedName, options.claudeConfigDir);
        safeParents(dirname(destination));
        const info = present(destination);
        const previous = receipt.installations.find(item => item.agent === agent && item.name === skill.installedName);
        let action = 'add';
        let reason;
        if (info) {
          if (!info.isDirectory() || info.isSymbolicLink()) { action = 'conflict'; reason = 'Destination is not a regular skill directory.'; }
          else if (!previous) { action = 'conflict'; reason = 'Existing skill is not managed by this AIWF installation record.'; }
          else if (previous.destination !== destination) { action = 'conflict'; reason = 'The recorded host configuration uses a different destination.'; }
          else if (previous.source_digest !== sourceDigest || previous.plugin_version !== bundle.version) {
            action = 'conflict'; reason = 'Installed source differs; updating is a separate operation.';
          } else {
            try {
              if (treeDigest(destination) === previous.digest) { action = 'keep'; }
              else { action = 'conflict'; reason = 'Installed files have local changes.'; }
            } catch (error) { action = 'conflict'; reason = error.message; }
          }
        }
        items.push({ agent, name: skill.installedName, plugin: bundle.name, plugin_version: bundle.version,
          source_digest: sourceDigest, destination, action, ...(reason ? { reason } : {}) });
      }
    }
  }
  return { scope: paths.scope, root: paths.root, manager: 'skills', backend_version: packageInfo.dependencies?.skills,
    bundles: bundles.map(bundle => ({ name: bundle.name, version: bundle.version })), items };
}

function skillsBinary() {
  let manifest;
  try { manifest = require.resolve('skills/package.json'); }
  catch { fail('The skills backend is missing. Reinstall the CLI with npm i -g aiwf.'); }
  const metadata = JSON.parse(readFileSync(manifest, 'utf8'));
  if (metadata.version !== packageInfo.dependencies?.skills) { fail('The installed skills backend does not match the pinned AIWF version.'); }
  const bin = typeof metadata.bin === 'string' ? metadata.bin : metadata.bin?.skills;
  if (!bin || isAbsolute(bin) || relative(dirname(manifest), resolve(dirname(manifest), bin)).startsWith('..')) { fail('Invalid skills executable.'); }
  return resolve(dirname(manifest), bin);
}

function runSkills({ source, skills, agent, global, project }) {
  const args = [skillsBinary(), 'add', source, '--skill', ...skills, '--agent', agent, '--copy', '--yes', '--json'];
  if (global) { args.push('--global'); }
  const result = spawnSync(process.execPath, args, { cwd: project, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, DISABLE_TELEMETRY: '1' } });
  return { status: result.status, error: result.error?.message, stdout: result.stdout, stderr: result.stderr };
}

function writeReceipt(paths, value) {
  const temporary = join(paths.state, `skills-installation-${process.pid}.tmp`);
  let created = false;
  try {
    writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    created = true;
    renameSync(temporary, paths.receipt);
  } finally { if (created) { rmSync(temporary, { force: true }); } }
}

export function installSkills(options = {}, { backend = runSkills } = {}) {
  let plan = planSkillInstallation(options);
  const conflicts = plan.items.filter(item => item.action === 'conflict');
  if (options.dryRun) { return { ...plan, dry_run: true, success: conflicts.length === 0 }; }
  if (conflicts.length) { fail('Installation conflicts; existing skills were preserved. Use --dry-run to inspect.', { conflicts }); }
  if (!plan.items.some(item => item.action === 'add')) { return { ...plan, dry_run: false, success: true }; }
  const paths = scopePaths(options);
  mkdirSync(paths.state, { recursive: true });
  const lock = join(paths.state, 'skills-installation.lock');
  try { mkdirSync(lock); }
  catch (error) { if (error.code === 'EEXIST') { fail(`An installation is already running, or its lock needs review: ${lock}`); } throw error; }
  let staging;
  try {
    // Recheck after acquiring the project/user-scope lock.
    plan = planSkillInstallation(options);
    if (plan.items.some(item => item.action === 'conflict')) { fail('Installation destinations changed; retry with --dry-run.'); }
    const receipt = readReceipt(paths.receipt);
    const sources = join(paths.state, 'skill-sources');
    safeParents(sources);
    mkdirSync(sources, { recursive: true });
    // Prepare and retain on the same filesystem, including projects on external volumes.
    staging = mkdtempSync(join(sources, '.staging-'));
    const staged = stageSkillBundles(staging, options);
    const expected = new Map(staged.map(item => [item.installedName, treeDigest(item.directory)]));
    // Keep a stable local source for skills-lock.json and later inspections.
    const sourceDigest = treeDigest(staging);
    const source = join(sources, sourceDigest);
    const previousSource = present(source);
    if (previousSource) {
      if (!previousSource.isDirectory() || previousSource.isSymbolicLink() || treeDigest(source) !== sourceDigest) {
        fail(`The retained skill source has local changes: ${source}`);
      }
    } else { renameSync(staging, source); staging = undefined; }
    const failures = [];
    for (const agent of [...new Set(plan.items.map(item => item.agent))]) {
      const pending = plan.items.filter(item => item.agent === agent && item.action === 'add');
      if (!pending.length) { continue; }
      let result;
      try {
        for (const item of pending) {
          safeParents(dirname(item.destination));
          if (present(item.destination)) { fail(`Destination appeared during installation: ${item.destination}`); }
        }
        result = backend({ source, skills: pending.map(item => item.name), agent,
          global: Boolean(options.global), project: options.global ? process.cwd() : paths.root });
      } catch (error) { result = { status: 1, error: error.message }; }
      for (const item of pending) {
        try {
          const info = present(item.destination);
          safeParents(dirname(item.destination));
          if (info?.isDirectory() && !info.isSymbolicLink() && treeDigest(item.destination) === expected.get(item.name)) {
            const record = { agent, name: item.name, plugin: item.plugin, plugin_version: item.plugin_version,
              source_digest: item.source_digest, digest: expected.get(item.name), destination: item.destination };
            receipt.installations = receipt.installations.filter(old => old.agent !== agent || old.name !== item.name);
            receipt.installations.push(record);
            item.action = 'installed';
          } else { failures.push({ agent, name: item.name, message: 'Installed resources are missing or differ from the selected bundle.' }); }
        } catch (error) { failures.push({ agent, name: item.name, message: error.message }); }
      }
      if (result.status !== 0) { failures.push({ agent, message: result.error || result.stderr?.slice(-2000) || 'skills CLI failed.' }); }
      // Verified partial successes are recorded, so the next attempt can safely resume.
      writeReceipt(paths, { schema_version: 1, aiwf_version: packageInfo.version, manager: 'skills',
        backend_version: packageInfo.dependencies?.skills, scope: paths.scope, installations: receipt.installations });
      if (failures.length) { break; }
    }
    if (failures.length) { fail('Skill installation was incomplete. Verified installs were recorded; inspect aiwf status before retrying.', { failures, items: plan.items }); }
    return { ...plan, dry_run: false, success: true };
  } finally {
    if (staging) { rmSync(staging, { recursive: true, force: true }); }
    rmSync(lock, { recursive: true, force: true });
  }
}

export function skillInstallationStatus(options = {}) {
  const paths = scopePaths(options);
  const receipt = readReceipt(paths.receipt);
  const items = receipt.installations.map(item => {
    const destination = skillDestination(paths.root, item.agent, options.global, item.name, options.claudeConfigDir);
    let status = 'missing';
    try {
      safeParents(dirname(destination));
      const info = present(destination);
      if (item.destination !== destination) { status = 'configuration_changed'; }
      else if (info?.isDirectory() && !info.isSymbolicLink()) { status = treeDigest(destination) === item.digest ? 'installed' : 'modified'; }
      else if (info) { status = 'modified'; }
    } catch { status = 'modified'; }
    return { ...item, destination, status, ...(status === 'configuration_changed'
      ? { recorded_destination: item.destination, reason: 'The current host configuration uses a different skill directory.' } : {}) };
  });
  return { scope: paths.scope, root: paths.root, manager: receipt.manager ?? 'skills', backend_version: receipt.backend_version,
    items, success: items.every(item => item.status === 'installed') };
}
