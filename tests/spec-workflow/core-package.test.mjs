import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const json = path => JSON.parse(readFileSync(root + path, 'utf8'));

test('methodology core is the primary independently installable package', () => {
  const market = json('.claude-plugin/marketplace.json');
  assert.equal(market.plugins[0].name, 'aiwf-core');
  const manifest = json('plugins/aiwf-core/.claude-plugin/plugin.json');
  assert.equal(manifest.name, 'aiwf-core');
  assert.equal(manifest.version, '2.19.0');
  assert.equal(manifest.author.name, 'Simon Martinelli');
  assert.equal(json('plugins/aiwf-core/UPSTREAM.json').source, 'aiup-core');
  assert.equal(readdirSync(root + 'plugins/aiwf-core/skills').length, 7);
  assert.deepEqual(readdirSync(root + 'plugins/aiwf-spec/skills').sort(), ['sync-docs', 'workflow']);
  const installer = readFileSync(root + 'scripts/install-spec-skills.mjs', 'utf8');
  assert.match(installer, /join\(plugins, 'aiwf-core'\)/);
});

test('methodology, optional delegation plugins and the spec CLI are distributed', () => {
  const names = ['aiwf-core', 'aiwf-spec', 'aiwf-delegate-claude', 'aiwf-delegate-codex', 'aiwf-vaadin-jooq', 'aiwf-angular-jpa', 'aiwf-blazor-dotnet', 'aiwf-nestjs-nextjs'];
  const market = json('.claude-plugin/marketplace.json');
  assert.deepEqual(market.plugins.map(p => p.name), names);
  assert.deepEqual(readdirSync(root + 'plugins').sort(), [...names].sort());
  const pkg = json('package.json');
  assert.deepEqual(pkg.bin, { 'aiwf-spec': './src/cli/spec-cli.js' });
  assert.equal(pkg.main, './src/lib/spec-workflow.js');
  assert.deepEqual(pkg.dependencies ?? {}, {});
  assert.deepEqual(pkg.devDependencies ?? {}, {});
  assert.equal(existsSync(root + '.claude-plugin/plugin.json'), false);
  for (const path of ['plugins/aiwf-core-legacy', 'src/cli/index.js', 'src/commands', 'src/config', 'src/utils', 'claude-code', 'skills', 'rules', 'jest.config.js']) {
    assert.equal(existsSync(root + path), false, path);
  }
  assert.equal(existsSync(root + 'plugins/aiwf-core/commands'), false);
  assert.equal(existsSync(root + 'plugins/aiwf-core/hooks'), false);
  for (const target of ['claude', 'codex']) {
    const skill = `delegate-${target}`;
    const plugin = `plugins/aiwf-delegate-${target}/`;
    assert.deepEqual(readdirSync(root + plugin + 'skills'), [skill]);
    assert.match(readFileSync(root + plugin + `skills/${skill}/SKILL.md`, 'utf8'), /disable-model-invocation: true/);
    for (const legalFile of ['LICENSE', 'NOTICE']) {
      assert.equal(readFileSync(root + plugin + `skills/${skill}/${legalFile}`, 'utf8'), readFileSync(root + plugin + legalFile, 'utf8'));
    }
  }
});
