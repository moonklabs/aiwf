#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { listSkillBundles } from '../lib/skill-bundles.js';
import { installSkills, skillInstallationStatus, supportedAgents } from '../lib/skill-installation.js';
import { run as runSpec } from './spec-cli.js';

const metadata = JSON.parse(readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8'));

function help() {
  return `AIWF - install your specification and development skill set

Install the CLI: npm i -g aiwf
Requires Node.js 22.20+; the pinned skills backend is included.
Usage: aiwf <command> [options]

Commands:
  install    Choose and install AIWF skills using the official skills CLI.
  list       Show available plugin bundles and their skill names.
  status     Check skills managed by this AIWF installation.
  spec       Run an existing aiwf-spec command (init, pin, check, packet).

Install options:
  --agent <codex|claude-code> ...  Explicit host selection; repeat or select both.
  --stack <name> ...              Optional stack bundles; see aiwf list.
  --delegate <claude|codex> ...    Optional delegation skills (off by default).
  --design                       Add the design-spec skills (aiwf-design-*).
  --core-only                    Omit the recommended workflow/sync-docs bundle.
  --project <path>                Existing project (default: current directory).
  --global                       Install skills for the current user.
  --dry-run                      Show additions, unchanged skills and conflicts.
  --json                         Machine-readable output.

Status options: --project <path>, --global, --json.
List options: --json.
Other options: --version, -h, --help.

Global npm installation installs the CLI. Skill scope defaults to the project.
Interactive install asks for hosts, stacks and delegates. Automation needs --agent.
Existing unmanaged or modified skills are preserved. No force-overwrite option.
Skills are portable instructions; native plugins and agent login are separate.
`;
}

function parse(args, command) {
  const allowed = command === 'install' ? ['agent', 'stack', 'delegate', 'design', 'project', 'global', 'core-only', 'dry-run', 'json']
    : command === 'status' ? ['project', 'global', 'json'] : ['json'];
  const arrays = new Set(['agent', 'stack', 'delegate']);
  const flags = new Set(['global', 'core-only', 'design', 'dry-run', 'json']);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const key = args[index].replace(/^--/, '');
    if (!args[index].startsWith('--') || !allowed.includes(key)) { throw new Error(`Unknown option: ${args[index]}`); }
    if (flags.has(key)) {
      if (options[key]) { throw new Error(`Duplicate option: --${key}`); }
      options[key] = true;
    } else if (arrays.has(key)) {
      const values = [];
      while (args[index + 1] && !args[index + 1].startsWith('-')) { values.push(...args[++index].split(',')); }
      if (!values.length || values.some(value => !value)) { throw new Error(`Missing value for --${key}`); }
      options[key] = [...(options[key] ?? []), ...values];
    } else {
      if (options[key]) { throw new Error(`Duplicate option: --${key}`); }
      const value = args[++index];
      if (!value || value.startsWith('-')) { throw new Error(`Missing value for --${key}`); }
      options[key] = value;
    }
  }
  if (options.global && options.project) { throw new Error('Choose --project or --global, not both.'); }
  return { agents: options.agent, stacks: options.stack, delegates: options.delegate, project: options.project,
    global: Boolean(options.global), coreOnly: Boolean(options['core-only']), design: options.design ? true : undefined,
    dryRun: Boolean(options['dry-run']), json: Boolean(options.json) };
}

async function choices(options) {
  const input = createInterface({ input: process.stdin, output: process.stderr });
  const values = text => text.trim() ? text.trim().split(/[\s,]+/) : [];
  try {
    process.stderr.write('AIWF skill installation (project scope unless --global)\n');
    options.agents = values(await input.question(`Hosts (${supportedAgents.join(', ')}; default codex): `));
    if (!options.agents.length) { options.agents = ['codex']; }
    if (!options.coreOnly) {
      const answer = (await input.question('Include workflow and document synchronization? [Y/n]: ')).trim().toLowerCase();
      if (!['', 'y', 'yes', 'n', 'no'].includes(answer)) { throw new Error('Answer yes or no for the workflow bundle.'); }
      options.coreOnly = ['n', 'no'].includes(answer);
    }
    if (!options.stacks) {
      const stacks = listSkillBundles().filter(item => item.kind === 'stack').map(item => item.id);
      options.stacks = values(await input.question(`Stacks (${stacks.join(', ')}; Enter for none): `));
    }
    if (!options.delegates) { options.delegates = values(await input.question('Delegation skills (claude, codex; Enter for none): ')); }
    if (options.design === undefined) {
      const answer = (await input.question('Include design-spec skills (aiwf-design)? [y/N]: ')).trim().toLowerCase();
      if (!['', 'y', 'yes', 'n', 'no'].includes(answer)) { throw new Error('Answer yes or no for the design-spec skills.'); }
      options.design = ['y', 'yes'].includes(answer);
    }
    return options;
  } finally { input.close(); }
}

function output(command, result, json) {
  if (json) { process.stdout.write(JSON.stringify({ command, ...result }, null, 2) + '\n'); return; }
  if (command === 'list') {
    for (const bundle of result.bundles) {
      process.stdout.write(`${bundle.name}@${bundle.version} (${bundle.kind})\n  ${bundle.skills.map(item => item.installedName).join(', ')}\n`);
    }
    return;
  }
  process.stdout.write(`${result.dry_run ? 'Installation plan' : command === 'status' ? 'Installation status' : 'Installation result'}: ${result.scope} ${result.root}\n`);
  if (!result.items.length) { process.stdout.write('No AIWF-managed skills are recorded in this scope.\n'); }
  for (const item of result.items) { process.stdout.write(`${(item.action ?? item.status).padEnd(10)} ${item.agent} ${item.name}${item.reason ? ': ' + item.reason : ''}\n`); }
  if (command === 'install' && !result.dry_run && result.success) {
    process.stdout.write('\nNext: invoke aiwf-docpilot to document or update an existing app, aiwf-reverse-engineer for focused discovery, or aiwf-requirements for a new project.\n');
    process.stdout.write(`Korean overview: ${fileURLToPath(new URL('../../README.ko.md', import.meta.url))}\n`);
    process.stdout.write('Full skill review documents: https://github.com/moonklabs/aiwf/tree/main/docs/ko-skills\n');
    process.stdout.write('Specification tools: aiwf spec --help (or aiwf-spec --help).\n');
  }
}

export async function run(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (!command || ['help', '-h', '--help'].includes(command)) { process.stdout.write(help()); return 0; }
  if (command === '--version') { process.stdout.write(metadata.version + '\n'); return 0; }
  if (command === 'spec') { return runSpec(args); }
  if (!['install', 'list', 'status'].includes(command)) { process.stderr.write(`Unknown command: ${command}\n` + help()); return 2; }
  if (args.includes('--help') || args.includes('-h')) { process.stdout.write(help()); return 0; }
  let options;
  try {
    options = parse(args, command);
    if (command === 'install' && !options.agents) {
      if (process.stdin.isTTY && !options.json) { options = await choices(options); }
      else { throw new Error('Select a host with --agent codex, --agent claude-code, or both.'); }
    }
  } catch (error) { process.stderr.write(error.message + '\n'); return 2; }
  try {
    const result = command === 'list' ? { bundles: listSkillBundles() }
      : command === 'status' ? skillInstallationStatus(options) : installSkills(options);
    output(command, result, options.json);
    return result.success === false ? 1 : 0;
  } catch (error) {
    if (options.json) { process.stdout.write(JSON.stringify({ command, error: { code: error.code ?? 'error', message: error.message, ...error.details } }, null, 2) + '\n'); }
    else {
      process.stderr.write(error.message + '\n');
      for (const item of error.details?.conflicts ?? error.details?.failures ?? []) {
        process.stderr.write(`${item.agent} ${item.name ?? ''}: ${item.reason ?? item.message}\n`);
      }
    }
    return 1;
  }
}

const direct = process.argv[1] && existsSync(process.argv[1])
  && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (direct) { process.exitCode = await run(); }
