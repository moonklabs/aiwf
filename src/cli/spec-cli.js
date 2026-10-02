#!/usr/bin/env node

/**
 * aiwf-spec - bounded AIWF specification workflow CLI.
 *
 * Commands: init, pin, check, packet. Built-in Node modules only.
 * This CLI records local snapshots and evidence; it never claims approval.
 */

import { existsSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import {
  initSpec,
  pinSpec,
  checkSpec,
  createReviewPacket,
  writeReviewPacket
} from '../lib/spec-workflow.js';

const EXIT_OK = 0;
const EXIT_FAILURE = 1;
const EXIT_USAGE = 2;

export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
    this.code = 'usage_error';
  }
}

export const COMMANDS = {
  init: {
    summary: 'Create minimal Draft AIUP-compatible spec files (never overwrites).',
    string: ['root', 'name'],
    boolean: ['json'],
    required: ['root', 'name']
  },
  pin: {
    summary: 'Snapshot the spec into .aiwf/spec-pin.json.',
    string: ['root'],
    boolean: ['json', 'refresh'],
    required: ['root']
  },
  check: {
    summary: 'Compare the pinned spec against the current working tree (read-only).',
    string: ['root'],
    boolean: ['json'],
    required: ['root']
  },
  packet: {
    summary: 'Build a local review packet from a pinned spec and an evidence file.',
    string: ['root', 'evidence', 'output'],
    boolean: ['json', 'force'],
    required: ['root', 'evidence']
  }
};

function camel(key) {
  return key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Strict option parser: unknown options, missing values, and stray positionals are rejected.
 */
export function parseOptions(args, config) {
  const options = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg.startsWith('--')) {
      let key = arg.slice(2);
      let value;
      const eq = key.indexOf('=');
      if (eq !== -1) {
        value = key.slice(eq + 1);
        key = key.slice(0, eq);
      }
      const name = camel(key);
      if (config.boolean.includes(name)) {
        if (value !== undefined) {
          throw new UsageError(`Option --${key} does not take a value.`);
        }
        options[name] = true;
      } else if (config.string.includes(name)) {
        if (value === undefined) {
          value = args[i + 1];
          i += 1;
        }
        if (value === undefined || value === '' || value.startsWith('--')) {
          throw new UsageError(`Missing value for option --${key}.`);
        }
        options[name] = value;
      } else {
        throw new UsageError(`Unknown option: --${key}`);
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      throw new UsageError(`Unknown option: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }

  if (positionals.length > 0) {
    throw new UsageError(`Unexpected argument: ${positionals[0]}`);
  }

  return options;
}

function printHelp(stream = process.stdout) {
  const lines = [
    'aiwf-spec - bounded AIWF specification workflow',
    '',
    'Usage: aiwf-spec <command> [options]',
    '',
    'Commands:'
  ];
  for (const [name, config] of Object.entries(COMMANDS)) {
    lines.push(`  ${name.padEnd(8)} ${config.summary}`);
  }
  lines.push(
    '',
    'Options:',
    '  --root <path>        Project root directory (required for all commands).',
    '  --name <title>       Product title for init.',
    '  --evidence <file>    Evidence JSON file for packet.',
    '  --output <path>      Packet output path (default .aiwf/review-packet.json).',
    '  --refresh            Overwrite an existing, differing pin (pin).',
    '  --force              Overwrite an existing review packet (packet).',
    '  --json               Emit machine-readable JSON on stdout.',
    '  -h, --help           Show this help.',
    '',
    'Notes:',
    '  Snapshots cover docs/vision.md, requirements.md, glossary.md, entity_model.md,',
    '  use_cases.puml, *.md under use_cases/test_cases/architecture/plans,',
    '  *.bpmn under docs/processes, and docs/.spec-lint-baseline.json when present.',
    '  Only unresolved TODO / NEEDS CLARIFICATION markers block pinning; Draft and',
    '  Reviewed status words are recorded as written and are not approvals.',
    '  Structural and semantic lint is not performed here; it remains an upstream step.',
    '',
    'Exit codes: 0 success, 1 spec/pin failure, 2 usage error.'
  );
  stream.write(`${lines.join('\n')}\n`);
}

function emitJson(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

function emitError(command, error, json) {
  const code = error.code || 'error';
  if (json) {
    emitJson({ command, error: { code, message: error.message } });
  } else {
    process.stderr.write(`${code}: ${error.message}\n`);
  }
}

function runInit(options) {
  const result = initSpec(options.root, options.name);
  if (options.json) {
    return { code: EXIT_OK, payload: result };
  }
  process.stdout.write(
    `Initialized spec at ${result.root}\nCreated: ${result.created.length}, preserved: ${result.preserved.length}\n`
  );
  return { code: EXIT_OK };
}

function runPin(options) {
  const result = pinSpec(options.root, { refresh: Boolean(options.refresh) });
  if (options.json) {
    return { code: EXIT_OK, payload: result };
  }
  const verb = result.unchanged ? 'Pin unchanged' : 'Pinned';
  process.stdout.write(`${verb} ${result.pin.files.length} files (digest ${result.digest}).\n`);
  return { code: EXIT_OK };
}

function runCheck(options) {
  const result = checkSpec(options.root);
  const code = result.in_sync ? EXIT_OK : EXIT_FAILURE;
  if (options.json) {
    return { code, payload: result };
  }
  process.stdout.write(`status: ${result.status}\n`);
  if (result.added.length > 0) {
    process.stdout.write(`added: ${result.added.join(', ')}\n`);
  }
  if (result.changed.length > 0) {
    process.stdout.write(`changed: ${result.changed.join(', ')}\n`);
  }
  if (result.deleted.length > 0) {
    process.stdout.write(`deleted: ${result.deleted.join(', ')}\n`);
  }
  if (result.draft_markers.length > 0) {
    process.stdout.write(`draft markers: ${result.draft_markers.map(m => m.path).join(', ')}\n`);
  }
  return { code };
}

function runPacket(options) {
  const packet = createReviewPacket(options.root, options.evidence, { cwd: process.cwd() });
  const written = writeReviewPacket(options.root, packet, {
    output: options.output,
    force: Boolean(options.force),
    cwd: process.cwd()
  });
  if (options.json) {
    return { code: EXIT_OK, payload: packet };
  }
  process.stdout.write(`Wrote review packet: ${written.output} (status: ${packet.status})\n`);
  return { code: EXIT_OK };
}

const RUNNERS = {
  init: runInit,
  pin: runPin,
  check: runCheck,
  packet: runPacket
};

/**
 * Execute the CLI. Returns the process exit code and writes all output.
 */
export function run(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return EXIT_OK;
  }

  const config = COMMANDS[command];
  if (!config) {
    process.stderr.write(`Unknown command: ${command}\n`);
    printHelp(process.stderr);
    return EXIT_USAGE;
  }

  let options;
  try {
    options = parseOptions(rest, config);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return EXIT_USAGE;
  }

  if (options.help) {
    printHelp();
    return EXIT_OK;
  }

  for (const required of config.required) {
    if (options[required] === undefined) {
      process.stderr.write(`Missing required option: --${required.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}\n`);
      return EXIT_USAGE;
    }
  }

  try {
    const result = RUNNERS[command](options);
    if (result.payload !== undefined) {
      emitJson(result.payload);
    }
    return result.code;
  } catch (error) {
    emitError(command, error, Boolean(options.json));
    return EXIT_FAILURE;
  }
}

export function main(argv = process.argv.slice(2)) {
  const code = run(argv);
  process.exitCode = code;
  return code;
}

const isDirect = process.argv[1] && existsSync(process.argv[1])
  && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isDirect) {
  main();
}

export default { run, main, parseOptions, COMMANDS };
