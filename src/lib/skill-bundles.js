/**
 * AIWF skill bundle catalog and staging.
 *
 * Built-in Node modules only. The catalog is driven by the packaged
 * `.claude-plugin/marketplace.json` and resolves its own repository root from
 * `import.meta.url`, so a globally installed npm bin works from any working
 * directory. Staging copies complete skill folders (SKILL.md, references,
 * scripts, rules, agents and the plugin LICENSE/NOTICE) under
 * `<directory>/skills/<installedName>` and rewrites installed Markdown to the
 * prefixed sibling names, without overwriting existing destinations.
 */

import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pluginsRoot = join(repositoryRoot, 'plugins');
const marketplaceFile = join(repositoryRoot, '.claude-plugin', 'marketplace.json');

const CORE_PLUGIN = 'aiwf-core';
const WORKFLOW_PLUGIN = 'aiwf-spec';
const DESIGN_PLUGIN = 'aiwf-design';
const DELEGATE_PLUGIN = 'aiwf-delegate-';

// Installed skill folders and plugin names are lowercase `aiwf-` identifiers, so the
// staged names stay safe for the skills CLI and cannot sanitize into a collision.
const SAFE_AIWF_NAME = /^aiwf-[a-z0-9-]+$/;

// Installed names: core, workflow and delegate skills share the `aiwf-` prefix;
// a stack adds its own id (for example `aiwf-nestjs-nextjs-implement`) and the
// design add-on keeps its plugin name (`aiwf-design-workflow`).
function pluginKind(name) {
  if (name === CORE_PLUGIN) { return 'core'; }
  if (name === WORKFLOW_PLUGIN) { return 'workflow'; }
  if (name === DESIGN_PLUGIN) { return 'design'; }
  if (name.startsWith(DELEGATE_PLUGIN)) { return 'delegate'; }
  if (name.startsWith('aiwf-')) { return 'stack'; }
  throw new Error(`Unsupported AIWF plugin name in the marketplace: ${name}`);
}

function pluginId(name, kind) {
  if (kind === 'stack') { return name.slice('aiwf-'.length); }
  if (kind === 'delegate') { return name.slice(DELEGATE_PLUGIN.length); }
  return null;
}

function installedPrefix(kind, id) {
  if (kind === 'stack') { return `aiwf-${id}-`; }
  return kind === 'design' ? `${DESIGN_PLUGIN}-` : 'aiwf-';
}

// Stack and design skill names are local to their plugin; the rest share one namespace.
const hasLocalNames = kind => kind === 'stack' || kind === 'design';

function readMarketplace() {
  const marketplace = JSON.parse(readFileSync(marketplaceFile, 'utf8'));
  const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  for (const plugin of plugins) {
    if (typeof plugin?.name !== 'string' || typeof plugin?.source !== 'string') {
      throw new Error('Marketplace plugin entries must declare a name and source.');
    }
  }
  return plugins;
}

function assertSafePluginName(name) {
  if (!SAFE_AIWF_NAME.test(name)) { throw new Error(`Unsafe AIWF plugin name: ${name}`); }
}

// Every staged source must resolve to exactly the packaged plugin location the
// installer fingerprints as `plugins/<name>`; anything else is rejected before a copy.
function pluginSource(name) {
  assertSafePluginName(name);
  const plugin = readMarketplace().find(entry => entry.name === name);
  if (!plugin) { throw new Error(`Unknown skill bundle: ${name}`); }
  const source = resolve(repositoryRoot, plugin.source);
  if (source !== join(pluginsRoot, name)) {
    throw new Error(`Marketplace source must be plugins/${name}: ${plugin.source}`);
  }
  return source;
}

/**
 * Marketplace-driven bundle catalog.
 *
 * Returns `{ name, version, kind, id, skills }` entries in marketplace order,
 * with `id` set for stack and delegate bundles and `skills` listing each skill's
 * source and prefixed installed name.
 */
export function listSkillBundles() {
  const seenPlugins = new Set();
  const seenInstalledNames = new Set();
  return readMarketplace().map(plugin => {
    if (seenPlugins.has(plugin.name)) { throw new Error(`Duplicate marketplace plugin name: ${plugin.name}`); }
    seenPlugins.add(plugin.name);
    assertSafePluginName(plugin.name);
    if (typeof plugin.version !== 'string' || plugin.version.trim() === '') {
      throw new Error(`Marketplace plugin is missing a version: ${plugin.name}`);
    }
    const source = pluginSource(plugin.name);
    const kind = pluginKind(plugin.name);
    const id = pluginId(plugin.name, kind);
    const skillsDirectory = join(source, 'skills');
    if (!existsSync(skillsDirectory) || !lstatSync(skillsDirectory).isDirectory()) {
      throw new Error(`Marketplace plugin has no skills directory: ${plugin.name}`);
    }
    const prefix = installedPrefix(kind, id);
    const skills = readdirSync(skillsDirectory).sort().map(name => {
      const installedName = `${prefix}${name}`;
      if (!SAFE_AIWF_NAME.test(installedName)) {
        throw new Error(`Unsafe installed skill name: ${installedName} (from ${plugin.name}/${name})`);
      }
      if (seenInstalledNames.has(installedName)) {
        throw new Error(`Duplicate installed skill name: ${installedName}`);
      }
      seenInstalledNames.add(installedName);
      return { name, installedName };
    });
    return { name: plugin.name, version: plugin.version, kind, id, skills };
  });
}

/**
 * Resolve a selection descriptor into bundles.
 *
 * Core is always included and the workflow bundle is included unless
 * `coreOnly` is set. Stacks, delegates and the design add-on are opt-in: only
 * the requested stack ids (any number), explicit delegate ids and `design: true`
 * are returned. Unknown ids throw.
 */
export function selectSkillBundles({ stacks = [], delegates = [], coreOnly = false, design = false } = {}) {
  if (!Array.isArray(stacks)) { throw new Error('stacks must be an array of stack ids'); }
  if (!Array.isArray(delegates)) { throw new Error('delegates must be an array of delegate ids'); }
  if (typeof design !== 'boolean') { throw new Error('design must be true or false'); }
  const catalog = listSkillBundles();
  const stackIds = catalog.filter(bundle => bundle.kind === 'stack').map(bundle => bundle.id);
  const delegateIds = catalog.filter(bundle => bundle.kind === 'delegate').map(bundle => bundle.id);
  for (const id of stacks) {
    if (!stackIds.includes(id)) { throw new Error(`Unknown stack: ${id}; choose ${stackIds.join(', ')}`); }
  }
  for (const id of delegates) {
    if (!delegateIds.includes(id)) { throw new Error(`Unknown delegate: ${id}; choose ${delegateIds.join(', ')}`); }
  }
  const wantedStacks = new Set(stacks);
  const wantedDelegates = new Set(delegates);
  return catalog.filter(bundle => {
    if (bundle.kind === 'core') { return true; }
    if (bundle.kind === 'workflow') { return !coreOnly; }
    if (bundle.kind === 'stack') { return wantedStacks.has(bundle.id); }
    if (bundle.kind === 'delegate') { return wantedDelegates.has(bundle.id); }
    if (bundle.kind === 'design') { return design; }
    return false;
  });
}

function planBundleEntries(bundles) {
  return bundles.flatMap(bundle => {
    const plugin = pluginSource(bundle.name);
    return bundle.skills.map(skill => ({
      bundle,
      plugin,
      name: skill.name,
      installedName: skill.installedName
    }));
  });
}

function rejectSymlink(path) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    throw new Error(`Refusing symbolic link: ${path}`);
  }
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) { throw new Error(`Refusing symbolic link: ${file}`); }
    return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : [];
  });
}

// Shared core, workflow and delegate names come from the full catalog, so staging one
// bundle yields the same Markdown regardless of which other bundles are selected.
function sharedSkillMapping() {
  const mapping = new Map();
  for (const bundle of listSkillBundles()) {
    if (hasLocalNames(bundle.kind)) { continue; }
    for (const skill of bundle.skills) { mapping.set(skill.name, skill.installedName); }
  }
  return mapping;
}

// Qualified Claude Code references such as `aiwf-design:trace` map to installed names.
// Design skills name core and workflow skills this way too; elsewhere `/aiwf-core:<skill>`
// is explanatory host text, so only design references are rewritten there.
function qualifiedSkillMapping() {
  const mapping = new Map();
  for (const bundle of listSkillBundles()) {
    if (!['core', 'workflow', 'design'].includes(bundle.kind)) { continue; }
    for (const skill of bundle.skills) { mapping.set(`${bundle.name}:${skill.name}`, skill.installedName); }
  }
  return mapping;
}

function qualifiedReferences(entry, qualified) {
  const keys = [...qualified.keys()].filter(key => entry.bundle.kind === 'design' || key.startsWith(`${DESIGN_PLUGIN}:`));
  return keys.length ? new RegExp(`(?<![\\w-])(${keys.join('|')})(?![\\w-])`, 'g') : null;
}

function rewriteInstalledMarkdown(destination, entry, entries, shared, qualified) {
  // Selected stack-local names overlay the shared mapping and stay isolated per plugin.
  const mapping = new Map(shared);
  for (const item of entries) {
    if (item.plugin === entry.plugin) { mapping.set(item.name, item.installedName); }
  }
  const commands = new RegExp(`(?<![.\\w-])/(${[...mapping.keys()].join('|')})(?![\\w-])`, 'g');
  const namedSkills = new RegExp('`(' + [...mapping.keys()].join('|') + ')`', 'g');
  const qualifiedRefs = qualifiedReferences(entry, qualified);
  for (const file of markdownFiles(destination)) {
    const original = readFileSync(file, 'utf8');
    let text = original;
    if (file === join(destination, 'SKILL.md')) {
      text = text.replace(/^name: .+$/m, `name: ${entry.installedName}`);
    }
    text = text.replace(commands, (_, name) => `/${mapping.get(name)}`)
      .replace(namedSkills, (_, name) => '`' + mapping.get(name) + '`');
    if (qualifiedRefs) { text = text.replace(qualifiedRefs, (_, ref) => qualified.get(ref)); }
    if (text !== original) {
      text += '\n<!-- AIWF installation modification: prefixed skill names and command references throughout bundled Markdown. -->\n';
      writeFileSync(file, text);
    }
  }
}

function assertVacantDestinations(destinations) {
  for (const destination of destinations) {
    // lstat detects dangling symlinks too.
    try {
      lstatSync(destination);
      throw new Error(`Skill already exists; no files overwritten: ${destination}`);
    } catch (error) {
      if (error.code !== 'ENOENT') { throw error; }
    }
  }
}

function copyEntries(skillsDirectory, entries, shared, qualified) {
  mkdirSync(skillsDirectory, { recursive: true });
  for (const entry of entries) {
    const destination = join(skillsDirectory, entry.installedName);
    cpSync(join(entry.plugin, 'skills', entry.name), destination, { recursive: true, errorOnExist: true, force: false });
    for (const notice of ['LICENSE', 'NOTICE']) { cpSync(join(entry.plugin, notice), join(destination, notice)); }
    for (const resource of ['rules', 'agents']) {
      if (existsSync(join(entry.plugin, resource))) {
        cpSync(join(entry.plugin, resource), join(destination, resource), { recursive: true, errorOnExist: true, force: false });
      }
    }
    rewriteInstalledMarkdown(destination, entry, entries, shared, qualified);
  }
}

function resolveSelection(selection) {
  if (Array.isArray(selection)) {
    const catalog = listSkillBundles();
    return selection.map(item => {
      const bundle = catalog.find(entry => entry.name === item?.name);
      if (!bundle) { throw new Error(`Unknown skill bundle: ${item?.name}`); }
      return bundle;
    });
  }
  if (selection && typeof selection === 'object') { return selectSkillBundles(selection); }
  throw new Error('A skill bundle selection is required.');
}

// Resolve a selection into concrete destination entries without writing files.
function planStaging(directory, selection) {
  const root = resolve(directory);
  rejectSymlink(root);
  if (existsSync(root) && !lstatSync(root).isDirectory()) {
    throw new Error(`Expected directory: ${root}`);
  }
  const skillsDirectory = join(root, 'skills');
  rejectSymlink(skillsDirectory);
  const entries = planBundleEntries(resolveSelection(selection));
  const planned = entries.map(entry => ({
    pluginName: entry.bundle.name,
    pluginVersion: entry.bundle.version,
    name: entry.name,
    installedName: entry.installedName,
    directory: join(skillsDirectory, entry.installedName)
  }));
  return { skillsDirectory, entries, planned };
}

/**
 * Plan the staging destinations for a selection without copying anything.
 *
 * Returns the same entries as `stageSkillBundles` and applies the same
 * containment checks and no-overwrite guard, so callers can inspect or dry-run a
 * bundle selection before staging it.
 */
export function planSkillBundles(directory, selection) {
  const { planned } = planStaging(directory, selection);
  assertVacantDestinations(planned.map(entry => entry.directory));
  return planned;
}

/**
 * Stage every selected bundle under `<directory>/skills/<installedName>`.
 *
 * `selection` is the array returned by `selectSkillBundles`, or the same options
 * object. Destinations are deterministic (marketplace order, sorted skills) and
 * an existing skill folder is never overwritten. Returns one entry per staged
 * skill: `{ pluginName, pluginVersion, name, installedName, directory }`.
 */
export function stageSkillBundles(directory, selection) {
  const { skillsDirectory, entries, planned } = planStaging(directory, selection);
  assertVacantDestinations(planned.map(entry => entry.directory));
  copyEntries(skillsDirectory, entries, sharedSkillMapping(), qualifiedSkillMapping());
  return planned;
}
