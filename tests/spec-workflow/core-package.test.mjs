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
  assert.deepEqual(readdirSync(root + 'plugins/aiwf-spec/skills'), ['workflow']);
  const installer = readFileSync(root + 'scripts/install-spec-skills.mjs', 'utf8');
  assert.match(installer, /join\(plugins, 'aiwf-core'\)/);
});

test('legacy core is preserved outside the methodology package', () => {
  assert.equal(existsSync(root + 'plugins/aiwf-core/commands'), false);
  assert.equal(existsSync(root + 'plugins/aiwf-core/hooks'), false);
  for (const path of ['commands/aiwf/session-start.md', 'hooks/hooks.json', 'agents/work-loop-agent.md', 'resources/templates/task_template.md']) {
    assert.equal(existsSync(root + 'plugins/aiwf-core-legacy/' + path), true, path);
  }
  const legacy = json('.claude-plugin/marketplace.json').plugins.find(p => p.name === 'aiwf-core-legacy');
  assert.equal(legacy.source, './plugins/aiwf-core-legacy');
});
