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
  assert.match(installer, /skill-bundles\.js/);
});

test('methodology, optional delegation plugins, the authored stack and the spec CLI are distributed', () => {
  const required = ['aiwf-core', 'aiwf-spec', 'aiwf-design', 'aiwf-delegate-claude', 'aiwf-delegate-codex', 'aiwf-vaadin-jooq', 'aiwf-angular-jpa', 'aiwf-blazor-dotnet', 'aiwf-nestjs-nextjs', 'aiwf-electron-react'];
  const market = json('.claude-plugin/marketplace.json');
  const marketNames = market.plugins.map(p => p.name);
  const pluginDirs = readdirSync(root + 'plugins').sort();
  assert.equal(marketNames[0], 'aiwf-core');
  assert.deepEqual([...marketNames].sort(), pluginDirs);
  for (const name of required) {
    assert.ok(pluginDirs.includes(name), `missing distributed plugin: ${name}`);
  }
  const pkg = json('package.json');
  assert.deepEqual(pkg.bin, { aiwf: './src/cli/aiwf-cli.js', 'aiwf-spec': './src/cli/spec-cli.js' });
  assert.equal(pkg.main, './src/lib/spec-workflow.js');
  assert.equal(pkg.dependencies.skills, '1.7.0');
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
  const desktop = 'plugins/aiwf-electron-react/';
  for (const skill of readdirSync(root + desktop + 'skills')) {
    // Standalone skills CLI installs must retain the full license.
    assert.equal(readFileSync(root + desktop + `skills/${skill}/LICENSE`, 'utf8'), readFileSync(root + desktop + 'LICENSE', 'utf8'));
  }
});
