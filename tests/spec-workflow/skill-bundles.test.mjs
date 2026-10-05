import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { listSkillBundles, planSkillBundles, selectSkillBundles, stageSkillBundles } from '../../src/lib/skill-bundles.js';

function scratch(t) {
  const root = mkdtempSync(join(tmpdir(), 'aiwf-bundles-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

const bundleOf = (kind, bundles = listSkillBundles()) => bundles.find(bundle => bundle.kind === kind);

test('catalog reports marketplace bundles with kinds, ids and prefixed installed names', () => {
  const bundles = listSkillBundles();
  const core = bundles.find(bundle => bundle.name === 'aiwf-core');
  assert.equal(core.kind, 'core');
  assert.equal(core.id, null);
  assert.equal(typeof core.version, 'string');
  for (const skill of core.skills) {
    assert.equal(skill.installedName, `aiwf-${skill.name}`);
  }
  const workflow = bundleOf('workflow', bundles);
  assert.equal(workflow.name, 'aiwf-spec');
  for (const skill of workflow.skills) {
    assert.equal(skill.installedName, `aiwf-${skill.name}`);
  }
  for (const stack of bundles.filter(bundle => bundle.kind === 'stack')) {
    assert.equal(stack.name, `aiwf-${stack.id}`);
    for (const skill of stack.skills) {
      assert.equal(skill.installedName, `aiwf-${stack.id}-${skill.name}`);
    }
  }
  for (const delegate of bundles.filter(bundle => bundle.kind === 'delegate')) {
    assert.equal(delegate.name, `aiwf-delegate-${delegate.id}`);
    for (const skill of delegate.skills) {
      assert.equal(skill.installedName, `aiwf-${skill.name}`);
    }
  }
});

test('selection always includes core, keeps workflow unless core-only, and opts in only the requested stacks and delegates', () => {
  assert.deepEqual(selectSkillBundles().map(bundle => bundle.kind), ['core', 'workflow']);
  assert.deepEqual(selectSkillBundles({ coreOnly: true }).map(bundle => bundle.name), ['aiwf-core']);

  const stackId = bundleOf('stack').id;
  const delegateId = bundleOf('delegate').id;
  const chosen = selectSkillBundles({ stacks: [stackId], delegates: [delegateId] });
  assert.deepEqual(
    chosen.filter(bundle => bundle.kind === 'stack' || bundle.kind === 'delegate').map(bundle => bundle.kind).sort(),
    ['delegate', 'stack']
  );
  assert.equal(chosen.find(bundle => bundle.kind === 'stack').id, stackId);
  assert.equal(chosen.find(bundle => bundle.kind === 'delegate').id, delegateId);
  assert.deepEqual(selectSkillBundles({ stacks: [stackId], delegates: [delegateId] }), chosen);
});

test('the design add-on is its own opt-in kind with plugin-local names', t => {
  const design = listSkillBundles().find(bundle => bundle.name === 'aiwf-design');
  assert.equal(design.kind, 'design');
  assert.equal(design.id, null);
  for (const skill of design.skills) { assert.equal(skill.installedName, `aiwf-design-${skill.name}`); }
  assert.equal(selectSkillBundles().some(bundle => bundle.kind === 'design'), false);
  assert.deepEqual(selectSkillBundles({ design: true }).map(bundle => bundle.kind), ['core', 'workflow', 'design']);
  assert.throws(() => selectSkillBundles({ design: 'yes' }), /design must be true or false/);
  // Its `workflow` skill must not take over the shared name used by the aiwf-spec bundle.
  const plain = scratch(t);
  const withDesign = scratch(t);
  stageSkillBundles(plain, selectSkillBundles());
  stageSkillBundles(withDesign, selectSkillBundles({ design: true }));
  const workflow = root => readFileSync(join(root, 'skills', 'aiwf-workflow', 'SKILL.md'), 'utf8');
  assert.equal(workflow(plain), workflow(withDesign));
});

test('multiple stacks can be selected and unknown selections are rejected before staging', t => {
  const stackIds = listSkillBundles().filter(bundle => bundle.kind === 'stack').map(bundle => bundle.id);
  assert.ok(stackIds.length >= 2);
  const selected = selectSkillBundles({ stacks: stackIds })
    .filter(bundle => bundle.kind === 'stack').map(bundle => bundle.id);
  assert.deepEqual(selected, stackIds);
  assert.throws(() => selectSkillBundles({ stacks: ['no-such-stack'] }), /Unknown stack: no-such-stack; choose /);
  assert.throws(() => selectSkillBundles({ delegates: ['no-such-delegate'] }), /Unknown delegate: no-such-delegate; choose /);
  const root = scratch(t);
  assert.throws(() => stageSkillBundles(root, [{ name: 'aiwf-not-real' }]), /Unknown skill bundle/);
  assert.equal(existsSync(join(root, 'skills')), false);
});

test('default staging installs the workflow, excludes delegates, and rewrites sibling references', t => {
  const root = scratch(t);
  const staged = stageSkillBundles(root, selectSkillBundles());
  const installed = new Set(staged.map(entry => entry.installedName));
  assert.ok(installed.has('aiwf-workflow'));
  assert.ok(installed.has('aiwf-sync-docs'));
  assert.equal([...installed].some(name => name.startsWith('aiwf-delegate-')), false);
  const workflow = readFileSync(join(root, 'skills', 'aiwf-workflow', 'SKILL.md'), 'utf8');
  assert.match(workflow, /^name: aiwf-workflow$/m);
  assert.match(workflow, /`aiwf-requirements`/);
  assert.doesNotMatch(workflow, /(?<![.\w-])\/spec-review(?![\w-])/);
});

test('delegation skills are staged only when explicitly selected', t => {
  const root = scratch(t);
  const staged = stageSkillBundles(root, selectSkillBundles({ delegates: ['codex'] }));
  const installed = staged.map(entry => entry.installedName);
  assert.ok(installed.includes('aiwf-delegate-codex'));
  assert.equal(installed.includes('aiwf-delegate-claude'), false);
  const skill = join(root, 'skills', 'aiwf-delegate-codex');
  assert.match(readFileSync(join(skill, 'SKILL.md'), 'utf8'), /^name: aiwf-delegate-codex$/m);
  assert.ok(existsSync(join(skill, 'agents', 'openai.yaml')));
});

test('staging isolates same-named stack skills and copies whole resources', t => {
  const root = scratch(t);
  const stacks = ['angular-jpa', 'nestjs-nextjs'];
  const staged = stageSkillBundles(root, selectSkillBundles({ stacks }));
  const names = staged.map(entry => entry.installedName);
  assert.equal(new Set(names).size, names.length);
  const skills = join(root, 'skills');
  for (const id of stacks) {
    const implement = staged.find(entry => entry.installedName === `aiwf-${id}-implement`);
    assert.ok(implement, `missing staged implement for ${id}`);
    assert.equal(implement.directory, join(skills, `aiwf-${id}-implement`));
    assert.equal(implement.pluginName, `aiwf-${id}`);
    assert.equal(typeof implement.pluginVersion, 'string');
    const text = readFileSync(join(implement.directory, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^name: aiwf-${id}-implement$`, 'm'));
    assert.doesNotMatch(text, /(?<![.\w-])\/(spec-review|implement)(?![\w-])/);
    assert.ok(existsSync(join(implement.directory, 'references')));
    assert.ok(existsSync(join(implement.directory, 'rules')));
    assert.ok(existsSync(join(implement.directory, 'LICENSE')));
    assert.ok(existsSync(join(implement.directory, 'NOTICE')));
  }
  assert.ok(existsSync(join(skills, 'aiwf-requirements')));
  assert.equal(existsSync(join(skills, 'implement')), false);
  // The angular plugin's agents resource travels with each of its staged skills.
  const angular = staged.find(entry => entry.pluginName === 'aiwf-angular-jpa' && entry.name === 'implement');
  assert.ok(existsSync(join(angular.directory, 'agents', 'uc-coverage.md')));
  // Deterministic ordering across repeated selection.
  assert.deepEqual(
    stageSkillBundles(scratch(t), selectSkillBundles({ stacks })).map(entry => entry.installedName),
    names
  );
});

test('planning reports destinations without writing and still guards existing skills', t => {
  const root = scratch(t);
  const planned = planSkillBundles(root, selectSkillBundles());
  assert.ok(planned.length > 0);
  assert.equal(existsSync(join(root, 'skills')), false);
  for (const entry of planned) {
    assert.equal(entry.directory, join(root, 'skills', entry.installedName));
  }
  mkdirSync(join(root, 'skills', planned[0].installedName), { recursive: true });
  assert.throws(() => planSkillBundles(root, selectSkillBundles()), /already exists/);
});

test('shared skill names map from the full catalog independent of the selected bundles', t => {
  const coreOnlyRoot = scratch(t);
  const withSpecRoot = scratch(t);
  const coreOnly = stageSkillBundles(coreOnlyRoot, selectSkillBundles({ stacks: ['electron-react'], coreOnly: true }));
  const withSpec = stageSkillBundles(withSpecRoot, selectSkillBundles({ stacks: ['electron-react'] }));
  const packageMarkdown = (root, staged) => readFileSync(
    join(root, 'skills', staged.find(entry => entry.installedName === 'aiwf-electron-react-package').installedName, 'SKILL.md'),
    'utf8'
  );
  const coreOnlyText = packageMarkdown(coreOnlyRoot, coreOnly);
  // The unselected workflow bundle is absent, yet its shared name is still rewritten and the
  // staged bytes match the run that selected it.
  assert.equal(existsSync(join(coreOnlyRoot, 'skills', 'aiwf-sync-docs')), false);
  assert.ok(existsSync(join(withSpecRoot, 'skills', 'aiwf-sync-docs')));
  assert.equal(coreOnlyText, packageMarkdown(withSpecRoot, withSpec));
  assert.match(coreOnlyText, /`aiwf-sync-docs`/);
  assert.doesNotMatch(coreOnlyText, /`sync-docs`/);
});

test('staging resolves the packaged plugins from an unrelated working directory', t => {
  const cwd = scratch(t);
  const out = join(cwd, 'out');
  const moduleUrl = new URL('../../src/lib/skill-bundles.js', import.meta.url).href;
  const script = [
    `import { listSkillBundles, selectSkillBundles, stageSkillBundles } from ${JSON.stringify(moduleUrl)};`,
    'const core = listSkillBundles().find(bundle => bundle.kind === \'core\');',
    `const staged = stageSkillBundles(${JSON.stringify(out)}, selectSkillBundles({ coreOnly: true }));`,
    'process.stdout.write(JSON.stringify({ core: core.name, staged: staged.length }));'
  ].join('\n');
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.core, 'aiwf-core');
  assert.ok(result.staged > 0);
  assert.ok(existsSync(join(out, 'skills', 'aiwf-requirements', 'SKILL.md')));
});

test('staging never rewrites a Markdown resource through a symbolic link', async t => {
  const root = scratch(t);
  const packageRoot = join(root, 'package');
  const module = join(packageRoot, 'src/lib/skill-bundles.js');
  mkdirSync(join(packageRoot, 'src/lib'), { recursive: true });
  cpSync(fileURLToPath(new URL('../../src/lib/skill-bundles.js', import.meta.url)), module);
  writeFileSync(join(packageRoot, 'package.json'), JSON.stringify({ type: 'module' }));
  mkdirSync(join(packageRoot, '.claude-plugin'));
  writeFileSync(join(packageRoot, '.claude-plugin/marketplace.json'), JSON.stringify({ plugins: [
    { name: 'aiwf-core', version: '1.0.0', source: './plugins/aiwf-core' }
  ] }));
  const plugin = join(packageRoot, 'plugins/aiwf-core');
  const skill = join(plugin, 'skills/requirements');
  mkdirSync(join(skill, 'references'), { recursive: true });
  writeFileSync(join(skill, 'SKILL.md'), '---\nname: requirements\ndescription: Gather requirements.\n---\n');
  for (const name of ['LICENSE', 'NOTICE']) { writeFileSync(join(plugin, name), name); }
  const outside = join(root, 'outside.md');
  const original = 'External `requirements` instructions.\n';
  writeFileSync(outside, original);
  symlinkSync(outside, join(skill, 'references/link.md'));
  const fixture = await import(pathToFileURL(module).href);
  assert.throws(() => fixture.stageSkillBundles(join(root, 'out'), { coreOnly: true }), /symbolic link/);
  assert.equal(readFileSync(outside, 'utf8'), original);
});
