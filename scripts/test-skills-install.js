#!/usr/bin/env node

// Exercise the official installer in an isolated project, never in the user's settings.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--cli')) {
  console.error('Usage: node scripts/test-skills-install.js [--cli /path/to/skills/bin/cli.mjs]');
  process.exit(1);
}

const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aiwf-skills-install-'));
try {
  function run(command, arguments_) {
    const result = spawnSync(command, arguments_, {
      cwd: temporaryRoot, encoding: 'utf8', timeout: 60000,
      env: { ...process.env, DISABLE_TELEMETRY: '1' }
    });
    assert.equal(result.status, 0, result.error?.message || `${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }

  function skills(arguments_) {
    return args.length
      ? run(process.execPath, [args[1], ...arguments_])
      : run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'skills@1.7.0', ...arguments_]);
  }

  async function files(directory, prefix = '') {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
      const relative = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        result.push(...await files(path.join(directory, entry.name), relative));
      } else {
        assert(entry.isFile(), `Skill resource must be a regular file: ${relative}`);
        result.push(relative);
      }
    }
    return result.sort();
  }

  const version = skills(['--version']).trim();
  const names = (await fs.readdir(path.join(sourceRoot, 'skills'))).sort();
  skills(['add', sourceRoot, '--list']);

  async function verifyInstallation(copy) {
    for (const destination of ['.agents/skills', '.claude/skills']) {
      const installedRoot = path.join(temporaryRoot, destination);
      assert.deepEqual((await fs.readdir(installedRoot)).sort(), names);
      for (const name of names) {
        const original = path.join(sourceRoot, 'skills', name);
        const installed = path.join(installedRoot, name);
        if (copy) {
          assert(!(await fs.lstat(installed)).isSymbolicLink(), 'Copy installation must be independent');
        }
        const installedTarget = path.relative(await fs.realpath(temporaryRoot), await fs.realpath(installed));
        assert(!installedTarget.startsWith('..') && !path.isAbsolute(installedTarget), 'Skill must not depend on the source checkout');
        const resourcePaths = await files(original);
        assert.deepEqual(await files(installed), resourcePaths);
        for (const resource of resourcePaths) {
          assert((await fs.readFile(path.join(original, resource)))
            .equals(await fs.readFile(path.join(installed, resource))), `Changed resource: ${name}/${resource}`);
        }
      }
      const helper = path.join(installedRoot, 'aiwf/scripts/project.mjs');
      const initialized = JSON.parse(run(process.execPath, [helper, 'init', temporaryRoot]));
      assert.equal(initialized.created.length + initialized.preserved.length, 5);
      const status = JSON.parse(run(process.execPath, [helper, 'status', temporaryRoot]));
      assert.equal(status.initialized, true);
      assert.deepEqual(status.invalidTasks, []);
    }
  }

  skills(['add', sourceRoot, '--agent', 'codex', 'claude-code', '--skill', '*', '-y']);
  await verifyInstallation(false);
  skills(['add', sourceRoot, '--agent', 'codex', 'claude-code', '--skill', '*', '--copy', '-y']);
  await verifyInstallation(true);

  const listed = JSON.parse(skills(['list', '--agent', 'codex', 'claude-code', '--json']));
  assert(Array.isArray(listed), 'The official CLI should list installed skills as JSON');
  assert.deepEqual([...new Set(listed.map(skill => skill.name))].sort(), names);
  console.log(`skills ${version}: ${names.length} skills installed for Codex and Claude Code in default and copy modes; all resources and installed helpers verified.`);
} finally {
  await fs.rm(temporaryRoot, { recursive: true, force: true });
}
