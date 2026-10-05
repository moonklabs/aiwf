#!/usr/bin/env node
import { existsSync, lstatSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { listSkillBundles, selectSkillBundles, planSkillBundles, stageSkillBundles } from '../src/lib/skill-bundles.js';

// Stack and delegate selections are derived from the shared marketplace catalog so the
// legacy installer and the managed `aiwf` CLI cannot drift apart.
const catalog = listSkillBundles();
export const supportedStacks = catalog.filter(bundle => bundle.kind === 'stack').map(bundle => bundle.id);
export const supportedDelegates = catalog.filter(bundle => bundle.kind === 'delegate').map(bundle => bundle.id);

function rejectSymlink(path) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    throw new Error(`Refusing symbolic link: ${path}`);
  }
}

export function installSpecSkills(project, { dryRun = false, stack, delegates = [], design = false } = {}) {
  if (stack !== undefined && !supportedStacks.includes(stack)) {
    throw new Error(`Unknown stack: ${stack}; choose ${supportedStacks.join(', ')}`);
  }
  if (!Array.isArray(delegates) || delegates.some(target => !supportedDelegates.includes(target))) {
    throw new Error(`Unknown delegate: choose ${supportedDelegates.join(', ')}`);
  }
  if (typeof design !== 'boolean') { throw new Error('design must be true or false'); }
  delegates = [...new Set(delegates)];
  const root = resolve(project);
  rejectSymlink(root);
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`Project directory does not exist: ${root}`);
  }
  const target = join(root, '.agents');
  const selection = selectSkillBundles({ stacks: stack ? [stack] : [], delegates, design });
  if (dryRun) {
    return { dry_run: true, destinations: planSkillBundles(target, selection).map(entry => entry.directory) };
  }
  return { dry_run: false, installed: stageSkillBundles(target, selection).map(entry => entry.directory) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let project;
    let dryRun = false;
    let stack;
    let design = false;
    const delegates = [];
    for (let index = 0; index < args.length; index++) {
      if (args[index] === '--project' && args[index + 1] && !args[index + 1].startsWith('--') && !project) {
        project = args[++index];
      } else if (args[index] === '--dry-run' && !dryRun) {
        dryRun = true;
      } else if (args[index] === '--stack' && args[index + 1] && !args[index + 1].startsWith('--') && !stack) {
        stack = args[++index];
      } else if (args[index] === '--delegate' && args[index + 1] && !args[index + 1].startsWith('--')) {
        delegates.push(args[++index]);
      } else if (args[index] === '--design' && !design) {
        design = true;
      } else if (args[index] === '--help') {
        console.log(`node scripts/install-spec-skills.mjs --project <existing-project> [--stack <${supportedStacks.join('|')}>] [--delegate <${supportedDelegates.join('|')}> ...] [--design] [--dry-run]`);
        process.exit(0);
      } else { throw new Error(`Unknown or incomplete argument: ${args[index]}`); }
    }
    if (!project) { throw new Error('--project is required'); }
    console.log(JSON.stringify(installSpecSkills(project, { dryRun, stack, delegates, design }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
