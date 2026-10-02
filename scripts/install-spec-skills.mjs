#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const plugins = resolve(dirname(fileURLToPath(import.meta.url)), '../plugins');
export const supportedStacks = ['vaadin-jooq', 'angular-jpa', 'blazor-dotnet', 'nestjs-nextjs'];

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : [];
  });
}

function rejectSymlink(path) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    throw new Error(`Refusing symbolic link: ${path}`);
  }
}

export function installSpecSkills(project, { dryRun = false, stack } = {}) {
  if (stack !== undefined && !supportedStacks.includes(stack)) {
    throw new Error(`Unknown stack: ${stack}; choose ${supportedStacks.join(', ')}`);
  }
  const root = resolve(project);
  rejectSymlink(root);
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`Project directory does not exist: ${root}`);
  }
  const target = join(root, '.agents', 'skills');
  for (const path of [join(root, '.agents'), target]) {
    rejectSymlink(path);
    if (existsSync(path) && !lstatSync(path).isDirectory()) {
      throw new Error(`Expected directory: ${path}`);
    }
  }
  const bundles = [
    { plugin: join(plugins, 'aiwf-core'), prefix: 'aiwf-' },
    { plugin: join(plugins, 'aiwf-spec'), prefix: 'aiwf-' }
  ];
  if (stack) { bundles.push({ plugin: join(plugins, `aiwf-${stack}`), prefix: `aiwf-${stack}-` }); }
  const entries = bundles.flatMap(bundle => readdirSync(join(bundle.plugin, 'skills')).sort()
    .map(name => ({ ...bundle, name, installedName: `${bundle.prefix}${name}` })));
  const destinations = entries.map(entry => join(target, entry.installedName));
  for (const destination of destinations) {
    // lstat detects dangling symlinks too.
    try {
      lstatSync(destination);
      throw new Error(`Skill already exists; no files overwritten: ${destination}`);
    } catch (error) {
      if (error.code !== 'ENOENT') { throw error; }
    }
  }
  if (dryRun) { return { dry_run: true, destinations }; }
  mkdirSync(target, { recursive: true });
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const destination = destinations[index];
    cpSync(join(entry.plugin, 'skills', entry.name), destination, { recursive: true, errorOnExist: true, force: false });
    for (const notice of ['LICENSE', 'NOTICE']) { cpSync(join(entry.plugin, notice), join(destination, notice)); }
    for (const resources of ['rules', 'agents']) {
      if (existsSync(join(entry.plugin, resources))) {
        cpSync(join(entry.plugin, resources), join(destination, resources), { recursive: true, errorOnExist: true, force: false });
      }
    }
    // Stack-local names take precedence; shared core commands retain their core names.
    const mapping = new Map(entries.filter(item => item.prefix === 'aiwf-').map(item => [item.name, item.installedName]));
    for (const item of entries.filter(item => item.plugin === entry.plugin)) {
      mapping.set(item.name, item.installedName);
    }
    const commands = new RegExp(`(?<![.\\w-])/(${[...mapping.keys()].join('|')})(?![\\w-])`, 'g');
    const namedSkills = new RegExp('`(' + [...mapping.keys()].join('|') + ')`', 'g');
    for (const file of markdownFiles(destination)) {
      const original = readFileSync(file, 'utf8');
      let text = original;
      if (file === join(destination, 'SKILL.md')) {
        text = text.replace(/^name: .+$/m, `name: ${entry.installedName}`);
      }
      text = text.replace(commands, (_, name) => `/${mapping.get(name)}`)
        .replace(namedSkills, (_, name) => '`' + mapping.get(name) + '`');
      if (text !== original) {
        text += '\n<!-- AIWF installation modification: prefixed skill names and command references throughout bundled Markdown. -->\n';
        writeFileSync(file, text);
      }
    }
  }
  return { dry_run: false, installed: destinations };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let project;
    let dryRun = false;
    let stack;
    for (let index = 0; index < args.length; index++) {
      if (args[index] === '--project' && args[index + 1] && !args[index + 1].startsWith('--') && !project) {
        project = args[++index];
      } else if (args[index] === '--dry-run' && !dryRun) {
        dryRun = true;
      } else if (args[index] === '--stack' && args[index + 1] && !args[index + 1].startsWith('--') && !stack) {
        stack = args[++index];
      } else if (args[index] === '--help') {
        console.log(`node scripts/install-spec-skills.mjs --project <existing-project> [--stack <${supportedStacks.join('|')}>] [--dry-run]`);
        process.exit(0);
      } else { throw new Error(`Unknown or incomplete argument: ${args[index]}`); }
    }
    if (!project) { throw new Error('--project is required'); }
    console.log(JSON.stringify(installSpecSkills(project, { dryRun, stack }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
